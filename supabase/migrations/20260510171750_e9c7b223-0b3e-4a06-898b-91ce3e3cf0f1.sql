
-- Table to track imported channel videos with metadata, prevent duplicates,
-- and control where each video appears (feed / reels)
CREATE TABLE IF NOT EXISTS public.channel_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  channel_id uuid NOT NULL REFERENCES public.user_channels(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'youtube',
  video_id text NOT NULL,
  video_url text NOT NULL,
  title text,
  description text,
  thumbnail text,
  author text,
  published_at timestamp with time zone,
  duration_seconds integer,
  views_count bigint NOT NULL DEFAULT 0,
  likes_count bigint NOT NULL DEFAULT 0,
  show_in_feed boolean NOT NULL DEFAULT true,
  show_in_reels boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT false,
  post_id uuid,
  imported_at timestamp with time zone NOT NULL DEFAULT now(),
  published_at_app timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, video_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_videos_user ON public.channel_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_videos_channel ON public.channel_videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_videos_video ON public.channel_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_channel_videos_feed ON public.channel_videos(user_id, show_in_feed) WHERE is_published;
CREATE INDEX IF NOT EXISTS idx_channel_videos_reels ON public.channel_videos(user_id, show_in_reels) WHERE is_published;

ALTER TABLE public.channel_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY cv_select_own ON public.channel_videos
  FOR SELECT USING (auth.uid() = user_id OR is_owner(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY cv_insert_own ON public.channel_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY cv_update_own ON public.channel_videos
  FOR UPDATE USING (auth.uid() = user_id OR is_owner(auth.uid()));

CREATE POLICY cv_delete_own ON public.channel_videos
  FOR DELETE USING (auth.uid() = user_id OR is_owner(auth.uid()));

CREATE TRIGGER channel_videos_updated_at
  BEFORE UPDATE ON public.channel_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Import sessions: one row per "import & confirm" action,
-- gives history, status, and prevents duplicate concurrent imports
CREATE TABLE IF NOT EXISTS public.channel_import_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  channel_id uuid REFERENCES public.user_channels(id) ON DELETE SET NULL,
  source_url text NOT NULL,
  platform text NOT NULL DEFAULT 'youtube',
  status text NOT NULL DEFAULT 'pending',
  videos_found integer NOT NULL DEFAULT 0,
  videos_imported integer NOT NULL DEFAULT 0,
  videos_skipped integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_import_sessions_user ON public.channel_import_sessions(user_id, created_at DESC);

ALTER TABLE public.channel_import_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY cis_select_own ON public.channel_import_sessions
  FOR SELECT USING (auth.uid() = user_id OR is_owner(auth.uid()));

CREATE POLICY cis_insert_own ON public.channel_import_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY cis_update_own ON public.channel_import_sessions
  FOR UPDATE USING (auth.uid() = user_id OR is_owner(auth.uid()));

CREATE POLICY cis_delete_own ON public.channel_import_sessions
  FOR DELETE USING (auth.uid() = user_id OR is_owner(auth.uid()));
