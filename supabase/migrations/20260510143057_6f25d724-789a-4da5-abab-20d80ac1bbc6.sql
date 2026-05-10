-- Add source tracking to articles for cross-project sync
ALTER TABLE public.articles 
  ADD COLUMN IF NOT EXISTS source_project text DEFAULT 'hnchat',
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS external_id text;

CREATE INDEX IF NOT EXISTS idx_articles_source_project ON public.articles(source_project);
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_external_unique ON public.articles(source_project, external_id) WHERE external_id IS NOT NULL;

-- Trigger: when an article is published, auto-create a feed post linking to it
CREATE OR REPLACE FUNCTION public.article_to_feed_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _slug text;
  _content text;
  _link text;
BEGIN
  -- Only when status transitions to published (insert as published OR update to published)
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    _slug := COALESCE(NEW.slug, NEW.id::text);
    _link := '/blog/' || NEW.id::text;
    _content := '📰 مقال جديد: ' || NEW.title || E'\n\n' || COALESCE(NEW.short_description, '') || E'\n\n🔗 ' || _link;

    INSERT INTO public.posts (user_id, content, type, media_urls)
    VALUES (
      NEW.author_id,
      _content,
      'article',
      CASE WHEN NEW.featured_image IS NOT NULL THEN ARRAY[NEW.featured_image] ELSE '{}'::text[] END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_article_to_feed_post ON public.articles;
CREATE TRIGGER trg_article_to_feed_post
AFTER INSERT OR UPDATE OF status ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.article_to_feed_post();

-- Storage for cross-project publishing secret (set via app_settings)
INSERT INTO public.app_settings (key, value, description)
VALUES ('cross_project_blog_secret', jsonb_build_object('token', encode(gen_random_bytes(32), 'hex')), 'Shared secret for external sites to publish articles via /api/public/articles')
ON CONFLICT (key) DO NOTHING;