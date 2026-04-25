-- 1. Country & language on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS language_code TEXT,
  ADD COLUMN IF NOT EXISTS locale_source TEXT DEFAULT 'auto';

CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(language_code);

-- 2. Groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_url TEXT,
  country_code TEXT,
  language_code TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  member_count INT NOT NULL DEFAULT 0,
  post_count INT NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- member | moderator | admin
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  likes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  country_code TEXT,
  language_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_group_posts_group ON public.group_posts(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_posts_country ON public.group_posts(country_code);

-- 3. Owner audit logs
CREATE TABLE IF NOT EXISTS public.owner_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.owner_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.owner_audit_logs(actor_id, created_at DESC);

-- 4. Feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  rollout_percent INT NOT NULL DEFAULT 100,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

INSERT INTO public.feature_flags (key, description) VALUES
  ('videos', 'Short videos feature'),
  ('marketplace', 'Marketplace feature'),
  ('live', 'Live streaming'),
  ('voice_rooms', 'Voice rooms'),
  ('trade', 'hnTrade crypto'),
  ('ai_hub', 'AI Hub'),
  ('signups', 'New user signups')
ON CONFLICT (key) DO NOTHING;

-- 5. Helper functions
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'owner')
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(_group_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = _group_id AND user_id = _user_id AND role IN ('admin', 'moderator')
  )
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group_id AND user_id = _user_id)
$$;

-- 6. RLS policies — groups
CREATE POLICY "groups_select_visible" ON public.groups FOR SELECT USING (
  NOT is_private OR is_group_member(id, auth.uid()) OR is_owner(auth.uid()) OR is_admin(auth.uid())
);
CREATE POLICY "groups_insert_auth" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "groups_update_admin" ON public.groups FOR UPDATE USING (
  is_group_admin(id, auth.uid()) OR is_owner(auth.uid())
);
CREATE POLICY "groups_delete_owner" ON public.groups FOR DELETE USING (
  auth.uid() = created_by OR is_owner(auth.uid())
);
CREATE POLICY "groups_owner_all" ON public.groups FOR ALL USING (is_owner(auth.uid()));

-- group_members
CREATE POLICY "gm_select_member_or_owner" ON public.group_members FOR SELECT USING (
  is_group_member(group_id, auth.uid()) OR is_owner(auth.uid()) OR is_admin(auth.uid())
);
CREATE POLICY "gm_insert_self_or_admin" ON public.group_members FOR INSERT WITH CHECK (
  auth.uid() = user_id OR is_group_admin(group_id, auth.uid()) OR is_owner(auth.uid())
);
CREATE POLICY "gm_delete_self_or_admin" ON public.group_members FOR DELETE USING (
  auth.uid() = user_id OR is_group_admin(group_id, auth.uid()) OR is_owner(auth.uid())
);
CREATE POLICY "gm_update_admin" ON public.group_members FOR UPDATE USING (
  is_group_admin(group_id, auth.uid()) OR is_owner(auth.uid())
);

-- group_posts
CREATE POLICY "gp_select_member" ON public.group_posts FOR SELECT USING (
  (NOT is_hidden AND is_group_member(group_id, auth.uid())) OR is_group_admin(group_id, auth.uid()) OR is_owner(auth.uid()) OR is_admin(auth.uid())
);
CREATE POLICY "gp_insert_member" ON public.group_posts FOR INSERT WITH CHECK (
  auth.uid() = user_id AND is_group_member(group_id, auth.uid())
);
CREATE POLICY "gp_update_own_or_admin" ON public.group_posts FOR UPDATE USING (
  auth.uid() = user_id OR is_group_admin(group_id, auth.uid()) OR is_owner(auth.uid())
);
CREATE POLICY "gp_delete_own_or_admin" ON public.group_posts FOR DELETE USING (
  auth.uid() = user_id OR is_group_admin(group_id, auth.uid()) OR is_owner(auth.uid())
);

-- audit logs (owner-only read; insertable by any authenticated for tracking)
CREATE POLICY "audit_select_owner" ON public.owner_audit_logs FOR SELECT USING (is_owner(auth.uid()));
CREATE POLICY "audit_insert_auth" ON public.owner_audit_logs FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- feature flags
CREATE POLICY "ff_select_all" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "ff_owner_write" ON public.feature_flags FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- 7. Owner can do everything across the existing tables (additive)
CREATE POLICY "profiles_owner_all" ON public.profiles FOR ALL USING (is_owner(auth.uid()));
CREATE POLICY "user_roles_owner_all" ON public.user_roles FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
CREATE POLICY "posts_owner_all" ON public.posts FOR ALL USING (is_owner(auth.uid()));
CREATE POLICY "products_owner_all" ON public.products FOR ALL USING (is_owner(auth.uid()));
CREATE POLICY "messages_owner_all" ON public.messages FOR ALL USING (is_owner(auth.uid()));
CREATE POLICY "comments_owner_all" ON public.comments FOR ALL USING (is_owner(auth.uid()));
CREATE POLICY "stories_owner_all" ON public.stories FOR ALL USING (is_owner(auth.uid()));
CREATE POLICY "notifications_owner_all" ON public.notifications FOR ALL USING (is_owner(auth.uid()));

-- 8. Triggers for counters
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS trg_group_members_count ON public.group_members;
CREATE TRIGGER trg_group_members_count
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();

CREATE OR REPLACE FUNCTION public.update_group_post_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups SET post_count = post_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS trg_group_posts_count ON public.group_posts;
CREATE TRIGGER trg_group_posts_count
AFTER INSERT OR DELETE ON public.group_posts
FOR EACH ROW EXECUTE FUNCTION public.update_group_post_count();