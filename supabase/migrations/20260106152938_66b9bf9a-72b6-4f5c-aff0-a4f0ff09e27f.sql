-- Create enums for governance types
CREATE TYPE public.policy_type AS ENUM (
  'MODEL_RESTRICTION',
  'TOKEN_LIMIT',
  'PII_BLOCK',
  'PROMPT_KEYWORD_BLOCK',
  'COST_LIMIT'
);

CREATE TYPE public.decision_type AS ENUM ('ALLOW', 'BLOCK');

CREATE TYPE public.demo_role AS ENUM ('CTO', 'PLATFORM', 'ENGINEER', 'FOUNDER', 'OTHER');

-- Demo sessions table (no auth, session-based access)
CREATE TABLE public.demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role demo_role NOT NULL DEFAULT 'ENGINEER',
  use_case TEXT,
  proxy_call_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Policies table
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  policy_type policy_type NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LLM requests table
CREATE TABLE public.llm_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_session_id UUID REFERENCES public.demo_sessions(id) ON DELETE CASCADE NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  tokens_requested INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LLM decisions table
CREATE TABLE public.llm_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  llm_request_id UUID REFERENCES public.llm_requests(id) ON DELETE CASCADE NOT NULL UNIQUE,
  decision decision_type NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]',
  cost_estimate DECIMAL(10, 6) NOT NULL DEFAULT 0,
  evaluation_time_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs table (append-only)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_session_id UUID REFERENCES public.demo_sessions(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read/write for demo purposes (no auth)
-- Demo sessions - anyone can create and read their own
CREATE POLICY "Allow public insert on demo_sessions" ON public.demo_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on demo_sessions" ON public.demo_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public update on demo_sessions" ON public.demo_sessions
  FOR UPDATE USING (true);

-- Policies table - public read, no write from frontend
CREATE POLICY "Allow public select on policies" ON public.policies
  FOR SELECT USING (true);

CREATE POLICY "Allow public update on policies" ON public.policies
  FOR UPDATE USING (true);

-- LLM requests - session-bound access
CREATE POLICY "Allow public insert on llm_requests" ON public.llm_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on llm_requests" ON public.llm_requests
  FOR SELECT USING (true);

-- LLM decisions - read-only from frontend
CREATE POLICY "Allow public insert on llm_decisions" ON public.llm_decisions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on llm_decisions" ON public.llm_decisions
  FOR SELECT USING (true);

-- Audit logs - append-only
CREATE POLICY "Allow public insert on audit_logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on audit_logs" ON public.audit_logs
  FOR SELECT USING (true);

-- Enable realtime for requests table
ALTER PUBLICATION supabase_realtime ADD TABLE public.llm_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.llm_decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;

-- Set replica identity for realtime
ALTER TABLE public.llm_requests REPLICA IDENTITY FULL;
ALTER TABLE public.llm_decisions REPLICA IDENTITY FULL;
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply trigger to policies table
CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default governance policies
INSERT INTO public.policies (name, policy_type, config, enabled, priority) VALUES
  ('Approved Models Only', 'MODEL_RESTRICTION', '{"allowedModels": ["gpt-4", "gpt-4-turbo", "claude-3-opus", "google/gemini-2.5-flash"], "blockedModels": ["gpt-3.5-turbo", "claude-instant"]}', true, 1),
  ('Token Rate Limit', 'TOKEN_LIMIT', '{"maxTokensPerRequest": 4096, "maxTokensPerSession": 100000, "maxTokensPerDay": 500000}', true, 2),
  ('PII Detection & Block', 'PII_BLOCK', '{"patterns": ["email", "phone", "ssn", "credit_card"], "action": "BLOCK", "logDetections": true}', true, 3),
  ('Sensitive Keyword Filter', 'PROMPT_KEYWORD_BLOCK', '{"blockedKeywords": ["password", "api_key", "secret", "internal docs", "confidential"], "caseSensitive": false}', true, 4),
  ('Cost Guardrail', 'COST_LIMIT', '{"maxCostPerRequest": 0.50, "maxCostPerSession": 10.00, "maxCostPerDay": 100.00}', false, 5);