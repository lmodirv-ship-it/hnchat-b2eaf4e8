INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('videos', 'videos', true, 104857600)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 104857600;

DROP POLICY IF EXISTS "videos_public_read" ON storage.objects;
CREATE POLICY "videos_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "videos_user_insert" ON storage.objects;
CREATE POLICY "videos_user_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "videos_user_update" ON storage.objects;
CREATE POLICY "videos_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "videos_user_delete" ON storage.objects;
CREATE POLICY "videos_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);