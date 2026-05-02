
-- App Settings table (key-value global config)
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings_owner_all" ON public.app_settings FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "app_settings_select_public" ON public.app_settings FOR SELECT USING (true);

-- Seed default settings
INSERT INTO public.app_settings (key, value, description) VALUES
  ('maintenance_mode', '{"enabled": false, "message": "الموقع تحت الصيانة"}'::jsonb, 'وضع الصيانة'),
  ('registration_enabled', '{"enabled": true}'::jsonb, 'السماح بالتسجيل الجديد'),
  ('welcome_message', '{"text": "مرحباً بك في HN Chat!"}'::jsonb, 'رسالة الترحيب'),
  ('ai_config', '{"default_model": "google/gemini-2.5-flash", "max_tokens_per_user": 10000}'::jsonb, 'إعدادات الذكاء الاصطناعي');

-- Usage Logs table (API/token usage tracking)
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service TEXT NOT NULL DEFAULT 'ai_chat',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  request_path TEXT,
  model TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_logs_select_own" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usage_logs_owner_all" ON public.usage_logs FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "usage_logs_insert_auth" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_usage_logs_user ON public.usage_logs (user_id);
CREATE INDEX idx_usage_logs_created ON public.usage_logs (created_at DESC);
CREATE INDEX idx_usage_logs_service ON public.usage_logs (service);

-- Support Tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select_own" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id OR is_owner(auth.uid()) OR is_admin(auth.uid()));
CREATE POLICY "tickets_insert_own" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_update_party" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id OR is_owner(auth.uid()) OR is_admin(auth.uid()));
CREATE POLICY "tickets_owner_all" ON public.support_tickets FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

CREATE INDEX idx_tickets_user ON public.support_tickets (user_id);
CREATE INDEX idx_tickets_status ON public.support_tickets (status);

-- Trigger for updated_at on support_tickets
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
