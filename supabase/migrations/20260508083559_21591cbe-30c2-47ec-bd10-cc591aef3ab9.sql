
-- 1. Remove overly permissive realtime policies from messages table
DROP POLICY IF EXISTS "realtime_authenticated_read" ON public.messages;
DROP POLICY IF EXISTS "realtime_authenticated_insert" ON public.messages;

-- 2. Fix shared_chats SELECT policy to prevent enumeration
DROP POLICY IF EXISTS "shared_chats_public_read_by_link" ON public.shared_chats;
CREATE POLICY "shared_chats_owner_read" ON public.shared_chats
  FOR SELECT USING (
    auth.uid() = user_id OR is_owner(auth.uid())
  );

-- 3. Restrict admin DELETE on user_roles to prevent demoting other admins/owners
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
CREATE POLICY "user_roles_admin_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()) OR is_owner(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "user_roles_admin_insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()) OR is_owner(auth.uid()));

CREATE POLICY "user_roles_admin_update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()) OR is_owner(auth.uid()));

CREATE POLICY "user_roles_admin_delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    (is_owner(auth.uid()))
    OR (is_admin(auth.uid()) AND role NOT IN ('admin', 'owner'))
  );
