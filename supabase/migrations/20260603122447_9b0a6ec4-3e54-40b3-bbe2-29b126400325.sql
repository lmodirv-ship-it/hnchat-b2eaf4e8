
-- 1) site_visits: remove public anon read
DROP POLICY IF EXISTS site_visits_select_anon ON public.site_visits;
DROP POLICY IF EXISTS site_visits_update_all ON public.site_visits;

-- 2) blog-images storage: scope writes to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own blog images" ON storage.objects;

CREATE POLICY "Users can upload own blog images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own blog images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'blog-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own blog images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'blog-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3) realtime.messages: replace blanket-true policies with participant-scoped
DROP POLICY IF EXISTS realtime_authenticated_read ON realtime.messages;
DROP POLICY IF EXISTS realtime_authenticated_insert ON realtime.messages;

CREATE POLICY realtime_participant_read
ON realtime.messages FOR SELECT TO authenticated
USING (
  -- Allow non-conversation topics; restrict 'conversation:<uuid>' topics to participants
  CASE
    WHEN realtime.topic() LIKE 'conversation:%' THEN
      public.is_conversation_participant(
        (substring(realtime.topic() from 'conversation:(.*)'))::uuid,
        auth.uid()
      )
    ELSE true
  END
);

CREATE POLICY realtime_participant_insert
ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN realtime.topic() LIKE 'conversation:%' THEN
      public.is_conversation_participant(
        (substring(realtime.topic() from 'conversation:(.*)'))::uuid,
        auth.uid()
      )
    ELSE true
  END
);
