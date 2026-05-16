-- Threaded comments + reports
ALTER TABLE public.article_comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.article_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_article_comments_parent ON public.article_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_article ON public.article_comments(article_id, created_at DESC);

-- Reports table (auto-approval => comments are public immediately; users can flag for review)
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.article_comments(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  UNIQUE (comment_id, reporter_id)
);

ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can report comments"
  ON public.comment_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON public.comment_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id OR is_admin(auth.uid()) OR is_owner(auth.uid()));

CREATE POLICY "Admins manage reports"
  ON public.comment_reports FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()) OR is_owner(auth.uid()))
  WITH CHECK (is_admin(auth.uid()) OR is_owner(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_comment_reports_comment ON public.comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON public.comment_reports(status);