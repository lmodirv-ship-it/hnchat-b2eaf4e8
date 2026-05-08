CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
  v_member_id TEXT;
BEGIN
  v_username := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'username', ''),
    CASE
      WHEN NEW.email IS NOT NULL AND NEW.email <> ''
        THEN SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(NEW.id::text, 1, 6)
      ELSE 'guest_' || SUBSTR(NEW.id::text, 1, 8)
    END
  );
  v_full_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), v_username);
  v_member_id := public.generate_member_id();

  INSERT INTO public.profiles (id, username, full_name, member_id)
  VALUES (NEW.id, v_username, v_full_name, v_member_id)
  ON CONFLICT (id) DO UPDATE SET member_id = COALESCE(public.profiles.member_id, EXCLUDED.member_id);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.profile_privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  -- Username collision: retry with a more unique fallback
  v_username := 'guest_' || SUBSTR(NEW.id::text, 1, 12);
  INSERT INTO public.profiles (id, username, full_name, member_id)
  VALUES (NEW.id, v_username, v_username, v_member_id)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;