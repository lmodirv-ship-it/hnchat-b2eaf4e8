
CREATE TABLE IF NOT EXISTS public.app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  name text NOT NULL,
  description text,
  changes jsonb NOT NULL DEFAULT '[]'::jsonb,
  files_changed jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "av_select_authenticated" ON public.app_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "av_owner_admin_all" ON public.app_versions
  FOR ALL USING (is_owner(auth.uid()) OR is_admin(auth.uid()))
  WITH CHECK (is_owner(auth.uid()) OR is_admin(auth.uid()));

CREATE TRIGGER trg_app_versions_updated_at
  BEFORE UPDATE ON public.app_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_app_versions_created_at ON public.app_versions (created_at DESC);
