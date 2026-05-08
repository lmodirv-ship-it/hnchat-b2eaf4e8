
-- Add IP and country columns to site_visits for richer tracking
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS referrer text;
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS device_type text;

-- Update INSERT policy to allow anonymous inserts (visitors)
DROP POLICY IF EXISTS "site_visits_insert_all" ON public.site_visits;
CREATE POLICY "site_visits_insert_all" ON public.site_visits FOR INSERT WITH CHECK (true);

-- Allow anonymous SELECT for the get_visitor_stats function
DROP POLICY IF EXISTS "site_visits_select_anon" ON public.site_visits;
CREATE POLICY "site_visits_select_anon" ON public.site_visits FOR SELECT USING (true);

-- Allow UPDATE so we can update last_seen for returning visitors
DROP POLICY IF EXISTS "site_visits_update_all" ON public.site_visits;
CREATE POLICY "site_visits_update_all" ON public.site_visits FOR UPDATE USING (true) WITH CHECK (true);

-- Trigger function to notify owner on new visitor
CREATE OR REPLACE FUNCTION public.notify_owner_on_visit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_owner_id uuid;
  v_page text;
BEGIN
  v_page := COALESCE(NEW.path, '/');
  
  -- Get all owners
  FOR v_owner_id IN SELECT user_id FROM public.user_roles WHERE role = 'owner'
  LOOP
    INSERT INTO public.notifications (user_id, type, content, link, title)
    VALUES (
      v_owner_id,
      'system'::notification_type,
      'زائر جديد في الصفحة: ' || v_page,
      v_page,
      'زائر جديد'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_new_site_visit ON public.site_visits;
CREATE TRIGGER on_new_site_visit
  AFTER INSERT ON public.site_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_owner_on_visit();
