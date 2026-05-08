-- Add new_post to notification_type enum
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_post';

-- Function to notify followers when a new post is created
CREATE OR REPLACE FUNCTION public.notify_followers_new_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  author_name text;
BEGIN
  -- Get author display name
  SELECT COALESCE(full_name, username, 'مستخدم') INTO author_name
  FROM public.profiles WHERE id = NEW.user_id;

  -- Insert a notification for each follower
  INSERT INTO public.notifications (user_id, actor_id, type, title, content, link)
  SELECT
    f.follower_id,
    NEW.user_id,
    'new_post'::notification_type,
    'منشور جديد',
    author_name || ' نشر منشوراً جديداً',
    '/post/' || NEW.id::text
  FROM public.follows f
  WHERE f.following_id = NEW.user_id
    AND f.follower_id <> NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_followers_new_post ON public.posts;
CREATE TRIGGER trg_notify_followers_new_post
AFTER INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.notify_followers_new_post();