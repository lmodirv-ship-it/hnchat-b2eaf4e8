
-- Enable realtime for tables not yet added
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.comments; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.likes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.follows; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Add last_seen to profiles for presence
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT now();

-- Index for presence queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles (last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON public.profiles (is_online) WHERE is_online = true;

-- Function to update last_seen on message send
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_seen = now(), is_online = true 
  WHERE id = NEW.sender_id;
  RETURN NEW;
END;
$$;

-- Trigger on messages
DROP TRIGGER IF EXISTS trg_update_last_seen ON public.messages;
CREATE TRIGGER trg_update_last_seen
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_user_last_seen();

-- Revoke from anon
REVOKE EXECUTE ON FUNCTION public.update_user_last_seen() FROM anon;
