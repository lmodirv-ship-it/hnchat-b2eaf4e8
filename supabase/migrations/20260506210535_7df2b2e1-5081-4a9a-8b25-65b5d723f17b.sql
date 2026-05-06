
-- Create profile_privacy_settings table
CREATE TABLE public.profile_privacy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  show_bio boolean NOT NULL DEFAULT true,
  show_posts_count boolean NOT NULL DEFAULT true,
  show_followers_count boolean NOT NULL DEFAULT true,
  show_following_count boolean NOT NULL DEFAULT true,
  show_join_date boolean NOT NULL DEFAULT true,
  show_message_button boolean NOT NULL DEFAULT true,
  show_follow_button boolean NOT NULL DEFAULT true,
  show_posts boolean NOT NULL DEFAULT true,
  show_last_active boolean NOT NULL DEFAULT false,
  show_online_status boolean NOT NULL DEFAULT false,
  show_media boolean NOT NULL DEFAULT true,
  show_groups boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read privacy settings (needed to render profiles correctly)
CREATE POLICY "privacy_select_all" ON public.profile_privacy_settings
  FOR SELECT USING (true);

-- User can update their own settings only
CREATE POLICY "privacy_update_own" ON public.profile_privacy_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- User can insert their own row (fallback)
CREATE POLICY "privacy_insert_own" ON public.profile_privacy_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner/admin read-only (already covered by select_all)

-- Auto-update updated_at
CREATE TRIGGER update_privacy_updated_at
  BEFORE UPDATE ON public.profile_privacy_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to also create privacy settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTR(NEW.id::text, 1, 6)
  );
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', v_username);

  INSERT INTO public.profiles (id, username, full_name)
  VALUES (NEW.id, v_username, v_full_name)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  -- Create default privacy settings
  INSERT INTO public.profile_privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Backfill: create privacy settings for existing users who don't have them
INSERT INTO public.profile_privacy_settings (user_id)
SELECT id FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.profile_privacy_settings ps WHERE ps.user_id = p.id);
