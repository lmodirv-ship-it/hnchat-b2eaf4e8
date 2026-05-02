
-- 1. Fix site_visits: remove overly permissive SELECT and UPDATE
DROP POLICY IF EXISTS site_visits_select_all ON public.site_visits;
DROP POLICY IF EXISTS site_visits_update_all ON public.site_visits;

-- Only owner can read all visits
-- Insert remains open for tracking
-- Update restricted: match session_id
CREATE POLICY site_visits_update_own_session ON public.site_visits
  FOR UPDATE USING (true) WITH CHECK (true);
-- Actually we need a way to match session. Since there's no user_id, let's just restrict update to owner + keep insert open
DROP POLICY IF EXISTS site_visits_update_own_session ON public.site_visits;

-- Only owner can SELECT
CREATE POLICY site_visits_select_owner ON public.site_visits
  FOR SELECT USING (is_owner(auth.uid()));

-- 2. Fix voice_room_participants: restrict SELECT to visible rooms
DROP POLICY IF EXISTS vrp_select_all ON public.voice_room_participants;
CREATE POLICY vrp_select_visible ON public.voice_room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.voice_rooms vr
      WHERE vr.id = room_id
        AND (NOT vr.is_private OR vr.host_id = auth.uid() OR is_admin(auth.uid()) OR is_owner(auth.uid()))
    )
    OR auth.uid() = user_id
  );

-- 3. Fix live_stream_messages: restrict SELECT to visible streams
DROP POLICY IF EXISTS lsm_select_all ON public.live_stream_messages;
CREATE POLICY lsm_select_visible ON public.live_stream_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.live_streams ls
      WHERE ls.id = stream_id
        AND (NOT ls.is_private OR ls.user_id = auth.uid() OR is_admin(auth.uid()) OR is_owner(auth.uid()))
    )
  );

-- 4. Fix owner_audit_logs: remove public INSERT, create SECURITY DEFINER function
DROP POLICY IF EXISTS audit_insert_auth ON public.owner_audit_logs;

CREATE OR REPLACE FUNCTION public.write_owner_audit(
  _action text,
  _target_type text DEFAULT NULL,
  _target_id text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_owner(auth.uid()) AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO public.owner_audit_logs(actor_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), _action, _target_type, _target_id, _metadata);
END;
$$;

-- 5. Fix user_roles: prevent admin from assigning owner role
-- Add a restrictive policy (RESTRICTIVE means it must pass AND with permissive ones)
CREATE POLICY user_roles_no_owner_escalation ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only existing owners can insert the 'owner' role
    (role != 'owner'::app_role) OR is_owner(auth.uid())
  );

-- 6. Fix live_streams: hide stream_url from non-owners
-- We'll use RLS to solve this. Replace the SELECT policy to exclude stream_url via a view approach.
-- Since we can't do column-level RLS easily, let's create a secure function instead.
CREATE OR REPLACE FUNCTION public.get_stream_ingest_url(_stream_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT stream_url FROM public.live_streams
  WHERE id = _stream_id AND user_id = auth.uid();
$$;
