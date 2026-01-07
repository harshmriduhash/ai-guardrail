-- Create app_role enum for user tiers
CREATE TYPE public.app_role AS ENUM ('free', 'pro', 'enterprise');

-- Create subscription_status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for freemium tiers
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status subscription_status NOT NULL DEFAULT 'active',
  plan app_role NOT NULL DEFAULT 'free',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  proxy_calls_used INTEGER NOT NULL DEFAULT 0,
  proxy_calls_limit INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's subscription tier limits
CREATE OR REPLACE FUNCTION public.get_plan_limits(_plan app_role)
RETURNS TABLE(proxy_calls_limit INTEGER, models_allowed TEXT[])
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE _plan
    WHEN 'free' THEN
      RETURN QUERY SELECT 100, ARRAY['gpt-3.5-turbo', 'google/gemini-2.5-flash'];
    WHEN 'pro' THEN
      RETURN QUERY SELECT 5000, ARRAY['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'google/gemini-2.5-flash'];
    WHEN 'enterprise' THEN
      RETURN QUERY SELECT 100000, ARRAY['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-instant', 'google/gemini-2.5-flash'];
    ELSE
      RETURN QUERY SELECT 100, ARRAY['gpt-3.5-turbo'];
  END CASE;
END;
$$;

-- Trigger to create profile and subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free');
  
  INSERT INTO public.subscriptions (user_id, plan, proxy_calls_limit)
  VALUES (NEW.id, 'free', 100);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update llm_requests to support authenticated users
ALTER TABLE public.llm_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update audit_logs to support authenticated users
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add RLS policy for authenticated users on llm_requests
CREATE POLICY "Users can view own requests"
  ON public.llm_requests FOR SELECT
  USING (auth.uid() = user_id OR demo_session_id IS NOT NULL);

CREATE POLICY "Users can insert own requests"
  ON public.llm_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id OR demo_session_id IS NOT NULL);

-- Add RLS policy for authenticated users on audit_logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id OR demo_session_id IS NOT NULL);

CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR demo_session_id IS NOT NULL);

-- Enable realtime for subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;