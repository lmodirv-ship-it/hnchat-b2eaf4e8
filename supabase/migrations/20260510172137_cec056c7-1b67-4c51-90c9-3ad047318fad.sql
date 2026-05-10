CREATE POLICY cv_select_public_published ON public.channel_videos
  FOR SELECT
  USING (is_published = true AND show_in_feed = true);
