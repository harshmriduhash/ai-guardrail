import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-demo-session',
};

// Policy evaluation types
interface PolicyConfig {
  allowedModels?: string[];
  blockedModels?: string[];
  maxTokensPerRequest?: number;
  maxTokensPerSession?: number;
  patterns?: string[];
  blockedKeywords?: string[];
  caseSensitive?: boolean;
  maxCostPerRequest?: number;
}

interface Policy {
  id: string;
  name: string;
  policy_type: string;
  config: PolicyConfig;
  enabled: boolean;
  priority: number;
}

type ViolationReason = 'PII_DETECTED' | 'TOKEN_LIMIT_EXCEEDED' | 'MODEL_NOT_ALLOWED' | 'KEYWORD_BLOCKED' | 'COST_LIMIT_EXCEEDED';

interface EvaluationResult {
  decision: 'ALLOW' | 'BLOCK';
  reasons: ViolationReason[];
  costEstimate: number;
  evaluationTimeMs: number;
}

// PII detection patterns
const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  phone: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/gi,
  ssn: /\d{3}[-\s]?\d{2}[-\s]?\d{4}/gi,
  credit_card: /\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/gi,
};

// Cost estimation (per 1K tokens)
const MODEL_COSTS: Record<string, number> = {
  'gpt-4': 0.03,
  'gpt-4-turbo': 0.01,
  'gpt-3.5-turbo': 0.002,
  'claude-3-opus': 0.015,
  'claude-instant': 0.0008,
  'google/gemini-2.5-flash': 0.001,
};

function evaluatePolicies(
  prompt: string,
  model: string,
  tokensRequested: number,
  policies: Policy[],
  sessionTokensUsed: number
): EvaluationResult {
  const startTime = performance.now();
  const reasons: ViolationReason[] = [];
  const costEstimate = (tokensRequested / 1000) * (MODEL_COSTS[model] || 0.01);

  // Sort policies by priority
  const sortedPolicies = policies.filter(p => p.enabled).sort((a, b) => a.priority - b.priority);

  for (const policy of sortedPolicies) {
    switch (policy.policy_type) {
      case 'MODEL_RESTRICTION': {
        const config = policy.config;
        if (config.blockedModels?.includes(model)) {
          reasons.push('MODEL_NOT_ALLOWED');
          console.log(`[POLICY] Model ${model} blocked by ${policy.name}`);
        } else if (config.allowedModels && !config.allowedModels.includes(model)) {
          reasons.push('MODEL_NOT_ALLOWED');
          console.log(`[POLICY] Model ${model} not in allowed list for ${policy.name}`);
        }
        break;
      }

      case 'TOKEN_LIMIT': {
        const config = policy.config;
        if (config.maxTokensPerRequest && tokensRequested > config.maxTokensPerRequest) {
          reasons.push('TOKEN_LIMIT_EXCEEDED');
          console.log(`[POLICY] Token limit exceeded: ${tokensRequested} > ${config.maxTokensPerRequest}`);
        }
        if (config.maxTokensPerSession && (sessionTokensUsed + tokensRequested) > config.maxTokensPerSession) {
          reasons.push('TOKEN_LIMIT_EXCEEDED');
          console.log(`[POLICY] Session token limit exceeded`);
        }
        break;
      }

      case 'PII_BLOCK': {
        const config = policy.config;
        const patterns = config.patterns || [];
        for (const patternName of patterns) {
          const pattern = PII_PATTERNS[patternName as keyof typeof PII_PATTERNS];
          if (pattern && pattern.test(prompt)) {
            reasons.push('PII_DETECTED');
            console.log(`[POLICY] PII detected: ${patternName}`);
            break;
          }
        }
        break;
      }

      case 'PROMPT_KEYWORD_BLOCK': {
        const config = policy.config;
        const keywords = config.blockedKeywords || [];
        const searchPrompt = config.caseSensitive ? prompt : prompt.toLowerCase();
        for (const keyword of keywords) {
          const searchKeyword = config.caseSensitive ? keyword : keyword.toLowerCase();
          if (searchPrompt.includes(searchKeyword)) {
            reasons.push('KEYWORD_BLOCKED');
            console.log(`[POLICY] Blocked keyword detected: ${keyword}`);
            break;
          }
        }
        break;
      }

      case 'COST_LIMIT': {
        const config = policy.config;
        if (config.maxCostPerRequest && costEstimate > config.maxCostPerRequest) {
          reasons.push('COST_LIMIT_EXCEEDED');
          console.log(`[POLICY] Cost limit exceeded: $${costEstimate.toFixed(4)} > $${config.maxCostPerRequest}`);
        }
        break;
      }
    }
  }

  const evaluationTimeMs = Math.round(performance.now() - startTime);

  return {
    decision: reasons.length > 0 ? 'BLOCK' : 'ALLOW',
    reasons: [...new Set(reasons)], // Remove duplicates
    costEstimate,
    evaluationTimeMs
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get demo session from header
    const demoSessionId = req.headers.get('x-demo-session');
    if (!demoSessionId) {
      console.log('[ERROR] Missing X-Demo-Session header');
      return new Response(
        JSON.stringify({ error: 'Missing X-Demo-Session header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate session
    const { data: session, error: sessionError } = await supabase
      .from('demo_sessions')
      .select('*')
      .eq('id', demoSessionId)
      .single();

    if (sessionError || !session) {
      console.log('[ERROR] Invalid session:', sessionError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid demo session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check session expiry
    if (new Date(session.expires_at) < new Date()) {
      console.log('[ERROR] Session expired');
      return new Response(
        JSON.stringify({ error: 'Demo session expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    if (session.proxy_call_count >= 50) {
      console.log('[ERROR] Rate limit exceeded for session:', demoSessionId);
      return new Response(
        JSON.stringify({ error: 'Demo session limit reached (50 calls)' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { model, prompt, max_tokens, forward_to_llm = false } = await req.json();

    if (!model || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: model, prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokensRequested = max_tokens || 512;

    console.log(`[PROXY] Processing request - Model: ${model}, Tokens: ${tokensRequested}`);

    // Fetch policies
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('*')
      .order('priority');

    if (policiesError) {
      console.log('[ERROR] Failed to fetch policies:', policiesError.message);
      throw new Error('Failed to fetch policies');
    }

    // Get session tokens used (sum of previous requests)
    const { data: previousRequests } = await supabase
      .from('llm_requests')
      .select('tokens_requested')
      .eq('demo_session_id', demoSessionId);

    const sessionTokensUsed = previousRequests?.reduce((sum, r) => sum + r.tokens_requested, 0) || 0;

    // Evaluate policies
    const evaluation = evaluatePolicies(prompt, model, tokensRequested, policies || [], sessionTokensUsed);

    console.log(`[PROXY] Evaluation result: ${evaluation.decision} - Reasons: ${evaluation.reasons.join(', ') || 'none'}`);

    // Store request
    const { data: llmRequest, error: requestError } = await supabase
      .from('llm_requests')
      .insert({
        demo_session_id: demoSessionId,
        model,
        prompt,
        tokens_requested: tokensRequested
      })
      .select()
      .single();

    if (requestError) {
      console.log('[ERROR] Failed to store request:', requestError.message);
      throw new Error('Failed to store request');
    }

    // Store decision
    const { error: decisionError } = await supabase
      .from('llm_decisions')
      .insert({
        llm_request_id: llmRequest.id,
        decision: evaluation.decision,
        reasons: evaluation.reasons,
        cost_estimate: evaluation.costEstimate,
        evaluation_time_ms: evaluation.evaluationTimeMs
      });

    if (decisionError) {
      console.log('[ERROR] Failed to store decision:', decisionError.message);
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      demo_session_id: demoSessionId,
      entity_type: 'llm_request',
      entity_id: llmRequest.id,
      action: evaluation.decision === 'ALLOW' ? 'REQUEST_ALLOWED' : 'REQUEST_BLOCKED',
      metadata: {
        model,
        tokens_requested: tokensRequested,
        reasons: evaluation.reasons,
        cost_estimate: evaluation.costEstimate,
        evaluation_time_ms: evaluation.evaluationTimeMs
      }
    });

    // Increment proxy call count
    await supabase
      .from('demo_sessions')
      .update({ proxy_call_count: session.proxy_call_count + 1 })
      .eq('id', demoSessionId);

    // If blocked, return error
    if (evaluation.decision === 'BLOCK') {
      return new Response(
        JSON.stringify({
          decision: 'BLOCK',
          reasons: evaluation.reasons,
          cost_estimate: evaluation.costEstimate,
          evaluation_time_ms: evaluation.evaluationTimeMs,
          request_id: llmRequest.id
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If allowed and forward_to_llm is true, actually call the LLM
    if (forward_to_llm && lovableApiKey) {
      console.log('[PROXY] Forwarding to LLM gateway...');
      
      try {
        const llmResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'user', content: prompt }
            ],
            max_tokens: tokensRequested
          }),
        });

        if (!llmResponse.ok) {
          const errorText = await llmResponse.text();
          console.log('[ERROR] LLM gateway error:', errorText);
          
          if (llmResponse.status === 429) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          throw new Error(`LLM gateway error: ${llmResponse.status}`);
        }

        const llmData = await llmResponse.json();
        const generatedText = llmData.choices?.[0]?.message?.content || '';

        return new Response(
          JSON.stringify({
            decision: 'ALLOW',
            reasons: [],
            cost_estimate: evaluation.costEstimate,
            evaluation_time_ms: evaluation.evaluationTimeMs,
            request_id: llmRequest.id,
            response: generatedText
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (llmError) {
        console.log('[ERROR] LLM call failed:', llmError);
        return new Response(
          JSON.stringify({
            decision: 'ALLOW',
            reasons: [],
            cost_estimate: evaluation.costEstimate,
            evaluation_time_ms: evaluation.evaluationTimeMs,
            request_id: llmRequest.id,
            error: 'LLM call failed, but request was allowed by policies'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Return success without LLM call
    return new Response(
      JSON.stringify({
        decision: 'ALLOW',
        reasons: [],
        cost_estimate: evaluation.costEstimate,
        evaluation_time_ms: evaluation.evaluationTimeMs,
        request_id: llmRequest.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ERROR] Proxy error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
