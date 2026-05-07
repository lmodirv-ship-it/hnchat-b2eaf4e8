
-- Content categories for articles/blog
CREATE TABLE IF NOT EXISTS public.content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view content categories" ON public.content_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage content categories" ON public.content_categories FOR ALL TO authenticated USING (public.is_owner(auth.uid()) OR public.is_admin(auth.uid()));

-- Article bookmarks
CREATE TABLE IF NOT EXISTS public.article_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id)
);
ALTER TABLE public.article_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON public.article_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add category_slug to articles if not exists
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category_slug TEXT;
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category_slug);

-- Increment tool views
CREATE OR REPLACE FUNCTION public.increment_tool_views(_tool_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.ai_tools SET views_count = views_count + 1 WHERE id = _tool_id;
END;
$$;
