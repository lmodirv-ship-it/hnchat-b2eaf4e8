
-- =============================================
-- FOREIGN KEYS: Core Social
-- =============================================

-- posts → profiles
ALTER TABLE public.posts
  ADD CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- comments → profiles, posts
ALTER TABLE public.comments
  ADD CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- likes → profiles, posts
ALTER TABLE public.likes
  ADD CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

-- follows → profiles
ALTER TABLE public.follows
  ADD CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- stories → profiles
ALTER TABLE public.stories
  ADD CONSTRAINT fk_stories_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- notifications → profiles
ALTER TABLE public.notifications
  ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_notifications_actor FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =============================================
-- FOREIGN KEYS: Messaging
-- =============================================

ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE public.conversation_participants
  ADD CONSTRAINT fk_cp_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_cp_conversation FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- =============================================
-- FOREIGN KEYS: AI
-- =============================================

ALTER TABLE public.ai_conversations
  ADD CONSTRAINT fk_ai_conv_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.ai_messages
  ADD CONSTRAINT fk_ai_msg_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_ai_msg_conversation FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id) ON DELETE CASCADE;

ALTER TABLE public.ai_usage
  ADD CONSTRAINT fk_ai_usage_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- =============================================
-- FOREIGN KEYS: Groups
-- =============================================

ALTER TABLE public.groups
  ADD CONSTRAINT fk_groups_creator FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.group_members
  ADD CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_gm_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.group_posts
  ADD CONSTRAINT fk_gp_group FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_gp_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- =============================================
-- FOREIGN KEYS: Commerce
-- =============================================

ALTER TABLE public.products
  ADD CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.cart_items
  ADD CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.orders
  ADD CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_orders_seller FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.order_items
  ADD CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_oi_seller FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =============================================
-- FOREIGN KEYS: Ads, Subscriptions, Settings
-- =============================================

ALTER TABLE public.ad_campaigns
  ADD CONSTRAINT fk_ads_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.owner_settings
  ADD CONSTRAINT fk_owner_settings_owner FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.catalog_items
  ADD CONSTRAINT fk_catalog_creator FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =============================================
-- FOREIGN KEYS: Mail
-- =============================================

ALTER TABLE public.mail_messages
  ADD CONSTRAINT fk_mail_sender FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_mail_recipient FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.mail_labels
  ADD CONSTRAINT fk_mail_labels_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.mail_message_labels
  ADD CONSTRAINT fk_mml_message FOREIGN KEY (message_id) REFERENCES public.mail_messages(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_mml_label FOREIGN KEY (label_id) REFERENCES public.mail_labels(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_mml_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- =============================================
-- FOREIGN KEYS: Live, Voice, Support, Others
-- =============================================

ALTER TABLE public.live_streams
  ADD CONSTRAINT fk_live_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.live_stream_messages
  ADD CONSTRAINT fk_lsm_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_lsm_stream FOREIGN KEY (stream_id) REFERENCES public.live_streams(id) ON DELETE CASCADE;

ALTER TABLE public.support_tickets
  ADD CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_tickets_assigned FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.reports
  ADD CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_reports_reviewer FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.shared_chats
  ADD CONSTRAINT fk_shared_chats_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.referrals
  ADD CONSTRAINT fk_referrals_referrer FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_referrals_referred FOREIGN KEY (referred_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.push_subscriptions
  ADD CONSTRAINT fk_push_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.owner_audit_logs
  ADD CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
