-- Fix 1: Extend RESTRICTIVE policy to also block admin escalation via UPDATE
-- Drop the existing INSERT-only restrictive policy
DROP POLICY IF EXISTS "user_roles_no_owner_escalation" ON public.user_roles;

-- Create a new RESTRICTIVE policy covering both INSERT and UPDATE
-- Only owners can assign 'owner' or 'admin' roles
CREATE POLICY "user_roles_no_privilege_escalation" ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (
    -- For SELECT/DELETE: allow all (no restriction needed)
    true
  )
  WITH CHECK (
    -- For INSERT/UPDATE: block admin and owner role assignment unless actor is owner
    (role NOT IN ('owner', 'admin')) OR is_owner(auth.uid())
  );

-- Fix 2: Replace public app_settings SELECT with authenticated-only
DROP POLICY IF EXISTS "app_settings_select_public" ON public.app_settings;

CREATE POLICY "app_settings_select_authenticated" ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix 3: Restrict shared_chats SELECT to specific share_id lookup instead of full table scan
DROP POLICY IF EXISTS "Shared chats are publicly viewable" ON public.shared_chats;

-- Shared chats should only be accessible if the caller knows the share_id
-- We use a function to safely check via RPC instead of exposing all rows
CREATE POLICY "shared_chats_select_by_owner_or_share" ON public.shared_chats
  FOR SELECT
  TO public
  USING (
    -- Owner can see their own shared chats
    (auth.uid() = user_id)
    -- Owner/admin can see all
    OR is_owner(auth.uid())
  );