-- Replace auto-generated guest usernames (e.g. "guest_a723fc24") with friendly
-- human names like Jack, Sofia, Adil. New guest profiles also get a friendly
-- name automatically via trigger.

CREATE OR REPLACE FUNCTION public.generate_friendly_username()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  names text[] := ARRAY[
    'Jack','Sofia','Adil','Liam','Emma','Noah','Olivia','Ahmed','Sara','Karim',
    'Lina','Yusuf','Maya','Omar','Aya','Hugo','Lea','Mateo','Lucia','Adam',
    'Nour','Zayn','Hiba','Reda','Salma','Amine','Imane','Rayan','Lila','Sami',
    'Mia','Leo','Ines','Diego','Paula','Pablo','Nora','Kenza','Yasmine','Hamza',
    'Anas','Iman','Layla','Khalil','Rania','Tariq','Selma','Adam','Ines','Marc'
  ];
  base text;
  candidate text;
  i int := 0;
BEGIN
  base := names[1 + floor(random() * array_length(names, 1))::int];
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    i := i + 1;
    candidate := base || i::text;
    IF i > 9999 THEN
      candidate := base || substr(md5(random()::text), 1, 4);
      EXIT;
    END IF;
  END LOOP;
  RETURN candidate;
END;
$$;

-- Backfill existing guest_* usernames
UPDATE public.profiles p
SET username = public.generate_friendly_username(),
    full_name = COALESCE(NULLIF(p.full_name, ''), NULL)
WHERE username ~* '^guest[_-]?[a-f0-9]+$';

-- Trigger: rewrite any new guest_* username on insert
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

DROP TRIGGER IF EXISTS profiles_friendly_username ON public.profiles;
CREATE TRIGGER profiles_friendly_username
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.rewrite_guest_username();
