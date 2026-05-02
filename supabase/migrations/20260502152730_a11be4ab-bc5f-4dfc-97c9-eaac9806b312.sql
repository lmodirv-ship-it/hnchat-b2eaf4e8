CREATE TABLE public.shared_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT NOT NULL UNIQUE DEFAULT LOWER(SUBSTR(MD5(gen_random_uuid()::text || NOW()::text), 1, 10)),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'محادثة AI',
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_shared_chats_share_id ON public.shared_chats (share_id);

ALTER TABLE public.shared_chats ENABLE ROW LEVEL SECURITY;

-- Anyone can view shared chats (they're public by design)
CREATE POLICY "Shared chats are publicly viewable"
ON public.shared_chats FOR SELECT
USING (true);

-- Authenticated users can create shared chats
CREATE POLICY "Authenticated users can share chats"
ON public.shared_chats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shared chats
CREATE POLICY "Users can delete their own shared chats"
ON public.shared_chats FOR DELETE
TO authenticated
USING (auth.uid() = user_id);