
-- Notify receiver when a new invitation is sent
CREATE OR REPLACE FUNCTION public.notify_on_chat_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM create_notification(
    NEW.receiver_id,
    NEW.sender_id,
    'system'::notification_type,
    'أرسل لك دعوة في المحادثات العامة',
    '/public-chat'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_chat_invite_insert
AFTER INSERT ON public.chat_invitations
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_chat_invite();

-- Notify sender when invitation is accepted or declined
CREATE OR REPLACE FUNCTION public.notify_on_chat_invite_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    PERFORM create_notification(
      NEW.sender_id,
      NEW.receiver_id,
      'system'::notification_type,
      'قبل دعوتك في المحادثات العامة',
      '/public-chat'
    );
  ELSIF OLD.status = 'pending' AND NEW.status = 'declined' THEN
    PERFORM create_notification(
      NEW.sender_id,
      NEW.receiver_id,
      'system'::notification_type,
      'رفض دعوتك في المحادثات العامة',
      '/public-chat'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_chat_invite_response
AFTER UPDATE ON public.chat_invitations
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_chat_invite_response();
