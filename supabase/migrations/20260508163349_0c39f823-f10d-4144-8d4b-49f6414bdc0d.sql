
-- 1) Add member_id column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_id text UNIQUE;

-- 2) Generator function: 1 letter (A-Z) + 6 digits, unique
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_letter text;
  v_digits text;
  v_candidate text;
  v_exists boolean;
  v_attempts int := 0;
BEGIN
  LOOP
    v_letter := chr(65 + floor(random() * 26)::int);
    v_digits := lpad(floor(random() * 1000000)::text, 6, '0');
    v_candidate := v_letter || v_digits;
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE member_id = v_candidate) INTO v_exists;
    EXIT WHEN NOT v_exists;
    v_attempts := v_attempts + 1;
    IF v_attempts > 50 THEN
      RAISE EXCEPTION 'Could not generate unique member_id';
    END IF;
  END LOOP;
  RETURN v_candidate;
END;
$$;

-- 3) Backfill existing profiles
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE member_id IS NULL LOOP
    UPDATE public.profiles SET member_id = public.generate_member_id() WHERE id = r.id;
  END LOOP;
END $$;

-- 4) Update handle_new_user to assign member_id automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
  v_member_id TEXT;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(NEW.id::text, 1, 6)
  );
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', v_username);
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
END;
$function$;
