
-- Add status column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- 1. owner_settings
CREATE TABLE IF NOT EXISTS public.owner_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  platform_name text NOT NULL DEFAULT 'hnChat',
  maintenance_mode boolean NOT NULL DEFAULT false,
  registration_enabled boolean NOT NULL DEFAULT true,
  ai_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_settings_owner_all" ON public.owner_settings FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE TRIGGER update_owner_settings_updated_at BEFORE UPDATE ON public.owner_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "reports_owner_all" ON public.reports FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "reports_admin_all" ON public.reports FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "reports_moderator_select" ON public.reports FOR SELECT USING (has_role(auth.uid(), 'moderator'::app_role));
CREATE POLICY "reports_moderator_update" ON public.reports FOR UPDATE USING (has_role(auth.uid(), 'moderator'::app_role));

-- 3. ai_usage
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  prompt_tokens int NOT NULL DEFAULT 0,
  completion_tokens int NOT NULL DEFAULT 0,
  total_tokens int NOT NULL DEFAULT 0,
  cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage_select_own" ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_usage_insert_own" ON public.ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_usage_owner_all" ON public.ai_usage FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "ai_usage_admin_select" ON public.ai_usage FOR SELECT USING (is_admin(auth.uid()));

-- 4. subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_owner_all" ON public.subscriptions FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "subscriptions_admin_select" ON public.subscriptions FOR SELECT USING (is_admin(auth.uid()));
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. is_moderator function
CREATE OR REPLACE FUNCTION public.is_moderator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('moderator'::app_role, 'admin'::app_role, 'owner'::app_role)
  )
$$;

-- 6. Update handle_new_user to also create subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(NEW.id::text, 1, 6)
  );
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', v_username);

  INSERT INTO public.profiles (id, username, full_name)
  VALUES (NEW.id, v_username, v_full_name)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$;
