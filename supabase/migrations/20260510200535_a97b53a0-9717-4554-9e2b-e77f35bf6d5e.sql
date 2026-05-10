
DROP TRIGGER IF EXISTS trg_posts_short_id ON public.posts;
CREATE TRIGGER trg_posts_short_id BEFORE INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_posts_short_id();

DROP TRIGGER IF EXISTS trg_articles_short_id ON public.articles;
CREATE TRIGGER trg_articles_short_id BEFORE INSERT ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_articles_short_id();

DROP TRIGGER IF EXISTS trg_channel_videos_short_id ON public.channel_videos;
CREATE TRIGGER trg_channel_videos_short_id BEFORE INSERT ON public.channel_videos
  FOR EACH ROW EXECUTE FUNCTION public.set_channel_videos_short_id();
