import { supabase } from '@/integrations/supabase/client';
import type { DemoAccessForm } from '@/types/governance';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Demo Access API
export async function createDemoSession(form: DemoAccessForm) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/demo-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: form.name,
      email: form.email,
      company: form.company,
      role: form.role,
      use_case: form.useCase
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create demo session');
  }

  return response.json();
}

// LLM Proxy API
export async function evaluateLLMRequest(
  demoSessionId: string,
  model: string,
  prompt: string,
  maxTokens: number = 512,
  forwardToLLM: boolean = false
) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/llm-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Session': demoSessionId,
    },
    body: JSON.stringify({
      model,
      prompt,
      max_tokens: maxTokens,
      forward_to_llm: forwardToLLM
    }),
  });

  const data = await response.json();
  
  if (response.status === 403) {
    return { ...data, blocked: true };
  }

  if (!response.ok && response.status !== 403) {
    throw new Error(data.error || 'Failed to evaluate request');
  }

  return { ...data, blocked: false };
}

// Database queries
export async function fetchPolicies() {
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .order('priority');

  if (error) throw error;
  return data as any[];
}

export async function togglePolicy(policyId: string, enabled: boolean) {
  const { data, error } = await supabase
    .from('policies')
    .update({ enabled })
    .eq('id', policyId)
    .select()
    .single();

  if (error) throw error;
  return data as any;
}

export async function fetchRequests(demoSessionId?: string) {
  let query = supabase
    .from('llm_requests')
    .select(`*, llm_decisions (*)`)
    .order('created_at', { ascending: false });

  if (demoSessionId) {
    query = query.eq('demo_session_id', demoSessionId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Transform to match expected format
  return (data || []).map((r: any) => ({
    ...r,
    llm_decisions: r.llm_decisions ? [r.llm_decisions] : []
  }));
}

export async function fetchAuditLogs(demoSessionId?: string, limit: number = 100) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (demoSessionId) {
    query = query.eq('demo_session_id', demoSessionId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
}

export async function fetchDemoSession(sessionId: string) {
  const { data, error } = await supabase
    .from('demo_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function logAuditEvent(
  demoSessionId: string,
  entityType: string,
  entityId: string | null,
  action: string,
  metadata: Record<string, unknown> = {}
) {
  const { error } = await supabase.from('audit_logs').insert({
    demo_session_id: demoSessionId,
    entity_type: entityType,
    entity_id: entityId,
    action,
    metadata
  } as any);

  if (error) console.error('Failed to log audit event:', error);
}
