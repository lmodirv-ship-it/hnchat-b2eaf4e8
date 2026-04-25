
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TYPE public.ad_status AS ENUM ('draft', 'active', 'paused', 'ended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.ad_type AS ENUM ('video', 'banner', 'story', 'product', 'sponsored_post');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type public.ad_type NOT NULL DEFAULT 'banner',
  status public.ad_status NOT NULL DEFAULT 'draft',
  budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
  spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions BIGINT NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  target_audience JSONB DEFAULT '{}'::jsonb,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_user_id ON public.ad_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ads_select_own" ON public.ad_campaigns;
CREATE POLICY "ads_select_own" ON public.ad_campaigns
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()) OR is_owner(auth.uid()));

DROP POLICY IF EXISTS "ads_insert_own" ON public.ad_campaigns;
CREATE POLICY "ads_insert_own" ON public.ad_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ads_update_own" ON public.ad_campaigns;
CREATE POLICY "ads_update_own" ON public.ad_campaigns
  FOR UPDATE USING (auth.uid() = user_id OR is_owner(auth.uid()));

DROP POLICY IF EXISTS "ads_delete_own" ON public.ad_campaigns;
CREATE POLICY "ads_delete_own" ON public.ad_campaigns
  FOR DELETE USING (auth.uid() = user_id OR is_owner(auth.uid()));

DROP POLICY IF EXISTS "ads_owner_all" ON public.ad_campaigns;
CREATE POLICY "ads_owner_all" ON public.ad_campaigns
  FOR ALL USING (is_owner(auth.uid()));

DROP TRIGGER IF EXISTS ad_campaigns_updated_at ON public.ad_campaigns;
CREATE TRIGGER ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
