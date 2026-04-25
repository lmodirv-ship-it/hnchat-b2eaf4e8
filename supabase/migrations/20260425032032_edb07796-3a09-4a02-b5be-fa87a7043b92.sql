-- Create stories bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "stories_public_read" ON storage.objects;
CREATE POLICY "stories_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

-- Authenticated users can upload to their own folder (userId/file.ext)
DROP POLICY IF EXISTS "stories_user_insert" ON storage.objects;
CREATE POLICY "stories_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stories'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "stories_user_update" ON storage.objects;
CREATE POLICY "stories_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stories'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "stories_user_delete" ON storage.objects;
CREATE POLICY "stories_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stories'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for stories table
ALTER TABLE public.stories REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.stories; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;