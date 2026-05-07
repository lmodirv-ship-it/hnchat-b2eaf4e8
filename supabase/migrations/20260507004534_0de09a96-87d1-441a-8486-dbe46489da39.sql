-- Fix public profile email exposure in existing rows
UPDATE public.profiles
SET username = 'user_' || replace(left(id::text, 8), '-', '')
WHERE username ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$';

UPDATE public.profiles
SET full_name = NULL
WHERE full_name ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$';

-- Prevent future email addresses from being stored in public display fields
CREATE OR REPLACE FUNCTION public.prevent_profile_email_leakage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NOT NULL AND NEW.username ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
    NEW.username := 'user_' || replace(left(NEW.id::text, 8), '-', '');
  END IF;

  IF NEW.full_name IS NOT NULL AND NEW.full_name ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' THEN
    NEW.full_name := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_email_leakage_trigger ON public.profiles;
CREATE TRIGGER prevent_profile_email_leakage_trigger
BEFORE INSERT OR UPDATE OF username, full_name ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_email_leakage();

-- Keep shared AI chats public by link while owners can manage their own shares
DROP POLICY IF EXISTS "shared_chats_select_by_owner_or_share" ON public.shared_chats;
DROP POLICY IF EXISTS "shared_chats_select_by_share_id" ON public.shared_chats;
CREATE POLICY "shared_chats_public_read_by_link"
ON public.shared_chats
FOR SELECT
USING (share_id IS NOT NULL OR auth.uid() = user_id OR is_owner(auth.uid()));

-- Remove broad admin read access to push subscription credentials
DROP POLICY IF EXISTS "push_select_own" ON public.push_subscriptions;
CREATE POLICY "push_select_own"
ON public.push_subscriptions
FOR SELECT
USING (auth.uid() = user_id OR is_owner(auth.uid()));

-- Remove admin read access to private stream ingest URLs via broad row reads
DROP POLICY IF EXISTS "live_select_visible" ON public.live_streams;
CREATE POLICY "live_select_visible"
ON public.live_streams
FOR SELECT
USING ((NOT is_private) OR auth.uid() = user_id OR is_owner(auth.uid()));

-- Ensure known functions have immutable search_path for the linter
ALTER FUNCTION public.prevent_profile_email_leakage() SET search_path = public;
ALTER FUNCTION public.enqueue_email(TEXT, JSONB) SET search_path = public;
ALTER FUNCTION public.read_email_batch(TEXT, INT, INT) SET search_path = public;
ALTER FUNCTION public.delete_email(TEXT, BIGINT) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) SET search_path = public;