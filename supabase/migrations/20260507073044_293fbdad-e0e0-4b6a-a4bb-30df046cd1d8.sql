
-- Create article categories table
CREATE TABLE public.article_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#00d4ff',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON public.article_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.article_categories FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()) OR public.is_owner(auth.uid()));

-- Insert default categories
INSERT INTO public.article_categories (name, name_ar, name_fr, slug, color, sort_order) VALUES
  ('Artificial Intelligence', 'ذكاء اصطناعي', 'Intelligence Artificielle', 'ai', '#00d4ff', 1),
  ('ChatGPT', 'ChatGPT', 'ChatGPT', 'chatgpt', '#10b981', 2),
  ('Crypto', 'عملات رقمية', 'Crypto', 'crypto', '#f59e0b', 3),
  ('Tutorials', 'دروس', 'Tutoriels', 'tutorials', '#8b5cf6', 4),
  ('News', 'أخبار', 'News', 'news', '#ef4444', 5),
  ('AI Tools', 'أدوات AI', 'Outils IA', 'tools', '#ec4899', 6),
  ('Technology', 'تكنولوجيا', 'Technologie', 'technology', '#06b6d4', 7);

-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.article_categories(id),
  language TEXT NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'fr', 'en')),
  featured_image TEXT,
  video_url TEXT,
  short_description TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  views_count INT NOT NULL DEFAULT 0,
  reading_time INT DEFAULT 1,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_articles_author ON public.articles(author_id);
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_language ON public.articles(language);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published articles
CREATE POLICY "Anyone can view published articles"
  ON public.articles FOR SELECT
  USING (status = 'published' OR author_id = auth.uid() OR public.is_admin(auth.uid()) OR public.is_owner(auth.uid()));

-- Users can create their own articles
CREATE POLICY "Users can create articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own articles
CREATE POLICY "Users can update own articles"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()) OR public.is_owner(auth.uid()));

-- Users can delete their own articles
CREATE POLICY "Users can delete own articles"
  ON public.articles FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()) OR public.is_owner(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment views
CREATE OR REPLACE FUNCTION public.increment_article_views(_article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.articles SET views_count = views_count + 1 WHERE id = _article_id;
END;
$$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);

CREATE POLICY "Anyone can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Users can update own blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-images');

CREATE POLICY "Users can delete own blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');
