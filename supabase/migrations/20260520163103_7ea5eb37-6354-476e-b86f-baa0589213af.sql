
CREATE TABLE IF NOT EXISTS public.site_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'web', -- 'web' | 'apk' | 'exe'
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  label TEXT,
  download_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active domains"
  ON public.site_domains FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners and admins can manage domains"
  ON public.site_domains FOR ALL
  USING (public.is_owner(auth.uid()) OR public.is_admin(auth.uid()))
  WITH CHECK (public.is_owner(auth.uid()) OR public.is_admin(auth.uid()));

CREATE TRIGGER update_site_domains_updated_at
  BEFORE UPDATE ON public.site_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_domains (domain, kind, is_primary, label) VALUES
  ('hn-chat.com',     'web', true,  'الموقع الرئيسي'),
  ('www.hn-chat.com', 'web', false, 'الموقع الرئيسي (www)'),
  ('hnchat.net',      'web', false, 'النطاق البديل'),
  ('www.hnchat.net',  'web', false, 'النطاق البديل (www)'),
  ('app-android',     'apk', false, 'تطبيق أندرويد APK'),
  ('app-windows',     'exe', false, 'تطبيق ويندوز EXE')
ON CONFLICT (domain) DO NOTHING;
