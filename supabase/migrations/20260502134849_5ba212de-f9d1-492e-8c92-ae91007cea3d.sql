
-- ai_conversations: owner full access
CREATE POLICY "aic_owner_all" ON public.ai_conversations FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- ai_messages: owner full access
CREATE POLICY "aim_owner_all" ON public.ai_messages FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- cart_items: owner full access
CREATE POLICY "cart_owner_all" ON public.cart_items FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- conversation_participants: owner full access
CREATE POLICY "cp_owner_all" ON public.conversation_participants FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- conversations: owner full access
CREATE POLICY "conv_owner_all" ON public.conversations FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- follows: owner full access
CREATE POLICY "follows_owner_all" ON public.follows FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- likes: owner full access
CREATE POLICY "likes_owner_all" ON public.likes FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- live_stream_messages: owner full access
CREATE POLICY "lsm_owner_all" ON public.live_stream_messages FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- mail_labels: owner full access
CREATE POLICY "mail_labels_owner_all" ON public.mail_labels FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- mail_message_labels: owner full access
CREATE POLICY "mail_msg_labels_owner_all" ON public.mail_message_labels FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- mail_messages: owner full access
CREATE POLICY "mail_owner_all" ON public.mail_messages FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- site_visits: owner full access
CREATE POLICY "site_visits_owner_all" ON public.site_visits FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- user_bookmarks: owner full access
CREATE POLICY "bookmarks_owner_all" ON public.user_bookmarks FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- voice_room_participants: owner full access
CREATE POLICY "vrp_owner_all" ON public.voice_room_participants FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- voice_rooms: owner full access (replace limited delete-only)
DROP POLICY IF EXISTS "vr_delete_own" ON public.voice_rooms;
CREATE POLICY "vr_owner_all" ON public.voice_rooms FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- push_subscriptions: owner full access (consolidate)
CREATE POLICY "push_owner_all" ON public.push_subscriptions FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- order_items: owner full access
CREATE POLICY "oi_owner_all" ON public.order_items FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));

-- live_streams: owner full access (consolidate existing partial)
CREATE POLICY "live_owner_all" ON public.live_streams FOR ALL USING (is_owner(auth.uid())) WITH CHECK (is_owner(auth.uid()));
