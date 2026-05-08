ALTER TABLE public.public_chat_messages 
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_type text,
  ALTER COLUMN content DROP NOT NULL;