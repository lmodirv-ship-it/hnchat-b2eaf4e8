-- Replace the friendly username generator with the x + 6 digits format
CREATE OR REPLACE FUNCTION public.generate_friendly_username()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  candidate text;
  i int := 0;
BEGIN
  LOOP
    candidate := 'x' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate);
    i := i + 1;
    IF i > 50 THEN
      candidate := 'x' || lpad(floor(random() * 1000000)::int::text, 6, '0') || substr(md5(random()::text), 1, 2);
      EXIT;
    END IF;
  END LOOP;
  RETURN candidate;
END;
$$;

-- Update the rewrite trigger function to also catch old guest_* patterns
CREATE OR REPLACE FUNCTION public.rewrite_guest_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NULL OR NEW.username ~* '^guest[_-]?[a-f0-9]+$' THEN
    NEW.username := public.generate_friendly_username();
  END IF;
  RETURN NEW;
END;
$$;

-- Backfill any remaining guest_* usernames to the new format
UPDATE public.profiles
SET username = public.generate_friendly_username()
WHERE username ~* '^guest[_-]?[a-f0-9]+$';