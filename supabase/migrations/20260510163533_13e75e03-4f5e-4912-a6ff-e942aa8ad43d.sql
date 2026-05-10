CREATE TABLE public.user_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL DEFAULT 'youtube',
  channel_url text NOT NULL,
  channel_id text,
  channel_name text,
  channel_avatar text,
  last_video_id text,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, channel_url)
);

ALTER TABLE public.user_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY uc_select_own ON public.user_channels FOR SELECT
  USING (auth.uid() = user_id OR is_owner(auth.uid()));

CREATE POLICY uc_insert_own ON public.user_channels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY uc_update_own ON public.user_channels FOR UPDATE
  USING (auth.uid() = user_id OR is_owner(auth.uid()));

CREATE POLICY uc_delete_own ON public.user_channels FOR DELETE
  USING (auth.uid() = user_id OR is_owner(auth.uid()));

CREATE TRIGGER user_channels_updated_at
  BEFORE UPDATE ON public.user_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_channels_user ON public.user_channels(user_id);
CREATE INDEX idx_user_channels_channel ON public.user_channels(channel_id);