
-- Public chat messages table
CREATE TABLE public.public_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.public_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public chat" ON public.public_chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Auth users can send messages" ON public.public_chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON public.public_chat_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR is_admin(auth.uid()) OR is_owner(auth.uid()));

CREATE POLICY "Owner manages all" ON public.public_chat_messages
  FOR ALL USING (is_owner(auth.uid()));

-- Chat invitations table
CREATE TABLE public.chat_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own invitations" ON public.chat_invitations
  FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Auth users can send invitations" ON public.chat_invitations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receiver can update invitation" ON public.chat_invitations
  FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete own invitations" ON public.chat_invitations
  FOR DELETE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Owner manages invitations" ON public.chat_invitations
  FOR ALL USING (is_owner(auth.uid()));

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.public_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_invitations;

-- Index for fast lookups
CREATE INDEX idx_public_chat_created ON public.public_chat_messages(created_at DESC);
CREATE INDEX idx_chat_invitations_receiver ON public.chat_invitations(receiver_id, status);
