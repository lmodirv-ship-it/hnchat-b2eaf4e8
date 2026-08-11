DROP POLICY IF EXISTS app_settings_select_authenticated ON public.app_settings;

CREATE POLICY app_settings_select_admin
ON public.app_settings
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()) OR public.is_owner(auth.uid()));

REVOKE SELECT ON public.app_settings FROM anon;