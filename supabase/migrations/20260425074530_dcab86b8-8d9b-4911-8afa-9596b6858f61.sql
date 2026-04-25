-- Visitor tracking table
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  path text
);

CREATE INDEX idx_site_visits_last_seen ON public.site_visits(last_seen DESC);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anon) to read for displaying stats
CREATE POLICY "site_visits_select_all"
ON public.site_visits FOR SELECT
USING (true);

-- Allow anyone to insert their visit
CREATE POLICY "site_visits_insert_all"
ON public.site_visits FOR INSERT
WITH CHECK (true);

-- Allow anyone to update their own session row (by session_id match in WHERE)
CREATE POLICY "site_visits_update_all"
ON public.site_visits FOR UPDATE
USING (true)
WITH CHECK (true);

-- Stats function: online (last 5 min) + total
CREATE OR REPLACE FUNCTION public.get_visitor_stats()
RETURNS TABLE(online_count bigint, total_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.site_visits WHERE last_seen > now() - interval '5 minutes') AS online_count,
    (SELECT count(*) FROM public.site_visits) AS total_count;
$$;

GRANT EXECUTE ON FUNCTION public.get_visitor_stats() TO anon, authenticated;