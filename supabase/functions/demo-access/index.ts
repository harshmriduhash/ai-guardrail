import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { name, email, company, role, use_case } = await req.json();

    // Validate required fields
    if (!name || !email || !company) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, company' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for free email domains
    const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (freeEmailDomains.includes(emailDomain)) {
      return new Response(
        JSON.stringify({ error: 'Please use your work email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[DEMO] Creating session for ${name} (${email}) from ${company}`);

    // Create demo session (48 hour expiry)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const { data: session, error: sessionError } = await supabase
      .from('demo_sessions')
      .insert({
        name,
        email,
        company,
        role: role || 'ENGINEER',
        use_case,
        expires_at: expiresAt.toISOString(),
        proxy_call_count: 0
      })
      .select()
      .single();

    if (sessionError) {
      console.log('[ERROR] Failed to create session:', sessionError.message);
      throw new Error('Failed to create demo session');
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      demo_session_id: session.id,
      entity_type: 'demo_session',
      entity_id: session.id,
      action: 'SESSION_CREATED',
      metadata: {
        name,
        email,
        company,
        role
      }
    });

    console.log(`[DEMO] Session created: ${session.id}`);

    return new Response(
      JSON.stringify({
        demo_session_id: session.id,
        expires_at: session.expires_at,
        max_proxy_calls: 50,
        message: 'Demo session created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ERROR] Demo access error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
