-- Mail labels (custom folders/tags per user)
CREATE TABLE public.mail_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#7c3aed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.mail_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mail_labels_select_own" ON public.mail_labels
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mail_labels_insert_own" ON public.mail_labels
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mail_labels_update_own" ON public.mail_labels
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "mail_labels_delete_own" ON public.mail_labels
  FOR DELETE USING (auth.uid() = user_id);

-- Mail messages table
CREATE TABLE public.mail_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID,
  cc_ids UUID[] NOT NULL DEFAULT '{}',
  bcc_ids UUID[] NOT NULL DEFAULT '{}',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- folder for the participant viewing it; we duplicate per-user via flags below
  is_draft BOOLEAN NOT NULL DEFAULT false,
  -- per-recipient state
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_starred_by_sender BOOLEAN NOT NULL DEFAULT false,
  is_starred_by_recipient BOOLEAN NOT NULL DEFAULT false,
  is_important BOOLEAN NOT NULL DEFAULT false,
  trashed_by_sender BOOLEAN NOT NULL DEFAULT false,
  trashed_by_recipient BOOLEAN NOT NULL DEFAULT false,
  archived_by_sender BOOLEAN NOT NULL DEFAULT false,
  archived_by_recipient BOOLEAN NOT NULL DEFAULT false,
  spam_by_recipient BOOLEAN NOT NULL DEFAULT false,
  reply_to UUID,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mail_thread ON public.mail_messages(thread_id);
CREATE INDEX idx_mail_sender ON public.mail_messages(sender_id);
CREATE INDEX idx_mail_recipient ON public.mail_messages(recipient_id);
CREATE INDEX idx_mail_created ON public.mail_messages(created_at DESC);

ALTER TABLE public.mail_messages ENABLE ROW LEVEL SECURITY;

-- A user can see a message if they are sender, recipient, in cc or bcc
CREATE POLICY "mail_select_participants" ON public.mail_messages
  FOR SELECT USING (
    auth.uid() = sender_id
    OR auth.uid() = recipient_id
    OR auth.uid() = ANY(cc_ids)
    OR auth.uid() = ANY(bcc_ids)
  );

-- Sender can insert their own messages (drafts or sent)
CREATE POLICY "mail_insert_sender" ON public.mail_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Sender can update their drafts; recipient can update their flags via RPC, but allow basic update for participants
CREATE POLICY "mail_update_participants" ON public.mail_messages
  FOR UPDATE USING (
    auth.uid() = sender_id
    OR auth.uid() = recipient_id
    OR auth.uid() = ANY(cc_ids)
  );

-- Sender can delete drafts only; full delete policy
CREATE POLICY "mail_delete_sender" ON public.mail_messages
  FOR DELETE USING (auth.uid() = sender_id AND is_draft = true);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_mail_messages_updated_at
  BEFORE UPDATE ON public.mail_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Pivot: messages <-> labels
CREATE TABLE public.mail_message_labels (
  message_id UUID NOT NULL REFERENCES public.mail_messages(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.mail_labels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, label_id, user_id)
);

ALTER TABLE public.mail_message_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mail_msg_labels_select_own" ON public.mail_message_labels
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mail_msg_labels_insert_own" ON public.mail_message_labels
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mail_msg_labels_delete_own" ON public.mail_message_labels
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for mail attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('mail-attachments', 'mail-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can upload to their own folder, and read attachments
-- belonging to messages they participate in (we keep it simple: owner-folder access).
CREATE POLICY "mail_attach_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'mail-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "mail_attach_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'mail-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "mail_attach_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'mail-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );