
DO $$
BEGIN
  INSERT INTO public.user_channels (user_id, platform, channel_url, channel_id, channel_name)
  SELECT DISTINCT user_id, 'youtube', 'imported://legacy', 'legacy-' || user_id::text, 'My Videos'
  FROM public.posts
  WHERE type='video' AND media_urls::text ~ '(youtube\.com|youtu\.be)'
  ON CONFLICT DO NOTHING;

  INSERT INTO public.channel_videos (
    user_id, channel_id, platform, video_id, video_url, title, thumbnail,
    show_in_feed, show_in_reels, is_published, post_id, published_at_app, published_at
  )
  SELECT DISTINCT ON (p.user_id, p.vid)
    p.user_id, uc.id, 'youtube', p.vid, p.media_urls[1],
    COALESCE(NULLIF(p.content, ''), 'Video'),
    'https://i.ytimg.com/vi/' || p.vid || '/hqdefault.jpg',
    true, true, true, p.id, p.created_at, p.created_at
  FROM (
    SELECT p.*, COALESCE(
      substring(p.media_urls[1] from '[?&]v=([A-Za-z0-9_-]{11})'),
      substring(p.media_urls[1] from 'youtu\.be/([A-Za-z0-9_-]{11})')
    ) AS vid
    FROM public.posts p
    WHERE p.type='video' AND p.media_urls::text ~ '(youtube\.com|youtu\.be)'
  ) p
  JOIN public.user_channels uc ON uc.user_id = p.user_id AND uc.channel_url = 'imported://legacy'
  WHERE p.vid IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.channel_videos cv
      WHERE cv.user_id = p.user_id AND cv.platform='youtube' AND cv.video_id = p.vid
    );
END $$;
