
-- Add likes_count to articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

-- Create article_comments table
CREATE TABLE public.article_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view article comments"
  ON public.article_comments FOR SELECT
  USING (true);

CREATE POLICY "Auth users can create comments"
  ON public.article_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.article_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin(auth.uid()) OR is_owner(auth.uid()));

-- Create article_likes table
CREATE TABLE public.article_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view article likes"
  ON public.article_likes FOR SELECT
  USING (true);

CREATE POLICY "Auth users can like"
  ON public.article_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
  ON public.article_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to update likes count
CREATE OR REPLACE FUNCTION public.update_article_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles SET likes_count = likes_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_article_likes_count_trigger
AFTER INSERT OR DELETE ON public.article_likes
FOR EACH ROW EXECUTE FUNCTION public.update_article_likes_count();
