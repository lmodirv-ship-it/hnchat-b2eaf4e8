
-- ============ LIVE STREAMING ============
CREATE TABLE public.live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_url TEXT,
  playback_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  viewer_count INTEGER NOT NULL DEFAULT 0,
  peak_viewers INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY live_select_visible ON public.live_streams FOR SELECT USING (NOT is_private OR auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY live_insert_own ON public.live_streams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY live_update_own ON public.live_streams FOR UPDATE USING (auth.uid() = user_id OR is_owner(auth.uid()));
CREATE POLICY live_delete_own ON public.live_streams FOR DELETE USING (auth.uid() = user_id OR is_owner(auth.uid()));
CREATE TRIGGER trg_live_streams_updated BEFORE UPDATE ON public.live_streams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.live_stream_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.live_stream_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY lsm_select_all ON public.live_stream_messages FOR SELECT USING (true);
CREATE POLICY lsm_insert_own ON public.live_stream_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY lsm_delete_own ON public.live_stream_messages FOR DELETE USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- ============ VOICE ROOMS ============
CREATE TABLE public.voice_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_participants INTEGER NOT NULL DEFAULT 50,
  participant_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.voice_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY vr_select_visible ON public.voice_rooms FOR SELECT USING (NOT is_private OR auth.uid() = host_id OR is_admin(auth.uid()));
CREATE POLICY vr_insert_own ON public.voice_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY vr_update_own ON public.voice_rooms FOR UPDATE USING (auth.uid() = host_id OR is_owner(auth.uid()));
CREATE POLICY vr_delete_own ON public.voice_rooms FOR DELETE USING (auth.uid() = host_id OR is_owner(auth.uid()));

CREATE TABLE public.voice_room_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'listener',
  is_muted BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);
ALTER TABLE public.voice_room_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY vrp_select_all ON public.voice_room_participants FOR SELECT USING (true);
CREATE POLICY vrp_insert_self ON public.voice_room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY vrp_update_self ON public.voice_room_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY vrp_delete_self ON public.voice_room_participants FOR DELETE USING (auth.uid() = user_id);

-- ============ TRADE ============
CREATE TYPE public.trade_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

CREATE TABLE public.trade_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiator_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  offered_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  requested_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  cash_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  message TEXT,
  status trade_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trade_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY trade_select_party ON public.trade_offers FOR SELECT USING (auth.uid() = initiator_id OR auth.uid() = recipient_id OR is_admin(auth.uid()));
CREATE POLICY trade_insert_initiator ON public.trade_offers FOR INSERT WITH CHECK (auth.uid() = initiator_id);
CREATE POLICY trade_update_party ON public.trade_offers FOR UPDATE USING (auth.uid() = initiator_id OR auth.uid() = recipient_id OR is_owner(auth.uid()));
CREATE POLICY trade_delete_initiator ON public.trade_offers FOR DELETE USING (auth.uid() = initiator_id OR is_owner(auth.uid()));
CREATE TRIGGER trg_trade_offers_updated BEFORE UPDATE ON public.trade_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AI CHAT ============
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  system_prompt TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY aic_select_own ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY aic_insert_own ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY aic_update_own ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY aic_delete_own ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_ai_conversations_updated BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ai_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY aim_select_own ON public.ai_messages FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY aim_insert_own ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY aim_delete_own ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);

-- ============ ORDERS / CART ============
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY cart_select_own ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cart_insert_own ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cart_update_own ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cart_delete_own ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  seller_id UUID,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  shipping_address JSONB,
  billing_address JSONB,
  payment_method TEXT,
  payment_reference TEXT,
  tracking_number TEXT,
  notes TEXT,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_select_party ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR is_admin(auth.uid()) OR is_owner(auth.uid()));
CREATE POLICY orders_insert_buyer ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY orders_update_party ON public.orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR is_admin(auth.uid()) OR is_owner(auth.uid()));
CREATE POLICY orders_delete_owner ON public.orders FOR DELETE USING (is_owner(auth.uid()));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  unit_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY oi_select_party ON public.order_items FOR SELECT USING (
  auth.uid() = seller_id OR
  EXISTS(SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid()) OR
  is_admin(auth.uid()) OR is_owner(auth.uid())
);
CREATE POLICY oi_insert_buyer ON public.order_items FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_id = auth.uid())
);

-- ============ PUSH NOTIFICATIONS ============
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth TEXT,
  device_type TEXT,
  device_name TEXT,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY push_select_own ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY push_insert_own ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY push_update_own ON public.push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY push_delete_own ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id OR is_owner(auth.uid()));

-- Indexes
CREATE INDEX idx_live_streams_user ON public.live_streams(user_id);
CREATE INDEX idx_live_streams_status ON public.live_streams(status);
CREATE INDEX idx_lsm_stream ON public.live_stream_messages(stream_id, created_at);
CREATE INDEX idx_voice_rooms_active ON public.voice_rooms(is_active);
CREATE INDEX idx_vrp_room ON public.voice_room_participants(room_id);
CREATE INDEX idx_trade_initiator ON public.trade_offers(initiator_id);
CREATE INDEX idx_trade_recipient ON public.trade_offers(recipient_id);
CREATE INDEX idx_aic_user ON public.ai_conversations(user_id);
CREATE INDEX idx_aim_conversation ON public.ai_messages(conversation_id, created_at);
CREATE INDEX idx_cart_user ON public.cart_items(user_id);
CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_push_user ON public.push_subscriptions(user_id);
