
CREATE TABLE IF NOT EXISTS public.article_comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.article_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_article_comment_likes_comment ON public.article_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_article_comment_likes_user ON public.article_comment_likes(user_id);

ALTER TABLE public.article_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comment likes" ON public.article_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Auth users can like comments" ON public.article_comment_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own" ON public.article_comment_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
