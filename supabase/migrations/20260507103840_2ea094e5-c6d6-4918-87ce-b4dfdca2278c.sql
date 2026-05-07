
-- 1. Enable RLS on realtime.messages and add authorization policies
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to receive realtime broadcasts/presence (non-postgres_changes)
CREATE POLICY "realtime_authenticated_read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert (needed for presence/broadcast)
CREATE POLICY "realtime_authenticated_insert"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Fix mutable search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
