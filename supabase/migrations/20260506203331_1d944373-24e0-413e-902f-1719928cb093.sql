
-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON public.ai_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON public.ai_usage(user_id, feature);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_status ON public.subscriptions(plan, status);

CREATE INDEX IF NOT EXISTS idx_owner_settings_owner ON public.owner_settings(owner_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mail_sender ON public.mail_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mail_recipient ON public.mail_messages(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mail_thread ON public.mail_messages(thread_id, created_at);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_oi_order ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status, priority);

CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stories_expires ON public.stories(expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_status ON public.live_streams(status);

CREATE INDEX IF NOT EXISTS idx_shared_chats_share_id ON public.shared_chats(share_id);

CREATE INDEX IF NOT EXISTS idx_push_user ON public.push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

-- FIX: Remove duplicate trigger on messages
DROP TRIGGER IF EXISTS trg_conv_last_message ON public.messages;

-- SECURITY: Revoke EXECUTE from anon on all SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.is_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_moderator(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_group_admin(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_visitor_stats() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_stream_ingest_url(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.write_owner_audit(text, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_post_likes_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_post_comments_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_user_posts_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_follow_counts() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_conversation_last_message() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_group_member_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_group_post_count() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.assign_owner_to_lmodurv() FROM anon;
