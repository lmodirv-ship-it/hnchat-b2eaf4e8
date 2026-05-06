
-- Enable realtime on notifications only (messages already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Add title column to notifications if missing
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title text;

-- Unified notification creator
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid, _actor_id uuid, _type notification_type, _content text, _link text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _user_id = _actor_id THEN RETURN; END IF;
  INSERT INTO public.notifications (user_id, actor_id, type, content, link) VALUES (_user_id, _actor_id, _type, _content, _link);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, uuid, notification_type, text, text) FROM anon;

-- Notify on like
CREATE OR REPLACE FUNCTION public.notify_on_like() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_post_owner uuid;
BEGIN
  SELECT user_id INTO v_post_owner FROM public.posts WHERE id = NEW.post_id;
  IF v_post_owner IS NOT NULL THEN
    PERFORM create_notification(v_post_owner, NEW.user_id, 'like'::notification_type, 'أعجب بمنشورك', '/post/' || NEW.post_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_like AFTER INSERT ON public.likes FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

-- Notify on comment
CREATE OR REPLACE FUNCTION public.notify_on_comment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_post_owner uuid;
BEGIN
  SELECT user_id INTO v_post_owner FROM public.posts WHERE id = NEW.post_id;
  IF v_post_owner IS NOT NULL THEN
    PERFORM create_notification(v_post_owner, NEW.user_id, 'comment'::notification_type, 'علّق على منشورك', '/post/' || NEW.post_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_comment AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Notify on follow
CREATE OR REPLACE FUNCTION public.notify_on_follow() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM create_notification(NEW.following_id, NEW.follower_id, 'follow'::notification_type, 'بدأ بمتابعتك', '/profile');
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_follow AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- Notify on message
CREATE OR REPLACE FUNCTION public.notify_on_message() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_participant RECORD;
BEGIN
  FOR v_participant IN SELECT user_id FROM public.conversation_participants WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id
  LOOP
    PERFORM create_notification(v_participant.user_id, NEW.sender_id, 'message'::notification_type, 'أرسل لك رسالة', '/messages/' || NEW.conversation_id);
  END LOOP;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notify_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

-- Security
REVOKE EXECUTE ON FUNCTION public.notify_on_like() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_on_comment() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_on_follow() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_on_message() FROM anon;
