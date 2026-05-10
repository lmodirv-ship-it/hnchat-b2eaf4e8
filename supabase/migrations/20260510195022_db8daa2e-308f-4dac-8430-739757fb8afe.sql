-- Generic short_id generator: lowercase letter + 6 digits, unique per table/column
CREATE OR REPLACE FUNCTION public.generate_short_id(_table text, _column text DEFAULT 'short_id')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_letter text;
  v_digits text;
  v_candidate text;
  v_exists boolean;
  v_attempts int := 0;
  v_sql text;
BEGIN
  LOOP
    v_letter := chr(97 + floor(random() * 26)::int); -- a-z
    v_digits := lpad(floor(random() * 1000000)::text, 6, '0');
    v_candidate := v_letter || v_digits;
    v_sql := format('SELECT EXISTS(SELECT 1 FROM public.%I WHERE %I = $1)', _table, _column);
    EXECUTE v_sql INTO v_exists USING v_candidate;
    EXIT WHEN NOT v_exists;
    v_attempts := v_attempts + 1;
    IF v_attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique short_id for %', _table;
    END IF;
  END LOOP;
  RETURN v_candidate;
END;
$$;

-- Add short_id column to the three tables
ALTER TABLE public.posts          ADD COLUMN IF NOT EXISTS short_id text;
ALTER TABLE public.articles       ADD COLUMN IF NOT EXISTS short_id text;
ALTER TABLE public.channel_videos ADD COLUMN IF NOT EXISTS short_id text;

-- Backfill existing rows
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.posts WHERE short_id IS NULL LOOP
    UPDATE public.posts SET short_id = public.generate_short_id('posts') WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id FROM public.articles WHERE short_id IS NULL LOOP
    UPDATE public.articles SET short_id = public.generate_short_id('articles') WHERE id = r.id;
  END LOOP;
  FOR r IN SELECT id FROM public.channel_videos WHERE short_id IS NULL LOOP
    UPDATE public.channel_videos SET short_id = public.generate_short_id('channel_videos') WHERE id = r.id;
  END LOOP;
END $$;

-- Unique constraints (must come after backfill)
ALTER TABLE public.posts          ADD CONSTRAINT posts_short_id_key          UNIQUE (short_id);
ALTER TABLE public.articles       ADD CONSTRAINT articles_short_id_key       UNIQUE (short_id);
ALTER TABLE public.channel_videos ADD CONSTRAINT channel_videos_short_id_key UNIQUE (short_id);

-- Triggers to auto-generate on insert if not provided
CREATE OR REPLACE FUNCTION public.set_posts_short_id()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.short_id IS NULL THEN NEW.short_id := public.generate_short_id('posts'); END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_articles_short_id()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.short_id IS NULL THEN NEW.short_id := public.generate_short_id('articles'); END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_channel_videos_short_id()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.short_id IS NULL THEN NEW.short_id := public.generate_short_id('channel_videos'); END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_posts_short_id          ON public.posts;
DROP TRIGGER IF EXISTS trg_articles_short_id       ON public.articles;
DROP TRIGGER IF EXISTS trg_channel_videos_short_id ON public.channel_videos;

CREATE TRIGGER trg_posts_short_id          BEFORE INSERT ON public.posts          FOR EACH ROW EXECUTE FUNCTION public.set_posts_short_id();
CREATE TRIGGER trg_articles_short_id       BEFORE INSERT ON public.articles       FOR EACH ROW EXECUTE FUNCTION public.set_articles_short_id();
CREATE TRIGGER trg_channel_videos_short_id BEFORE INSERT ON public.channel_videos FOR EACH ROW EXECUTE FUNCTION public.set_channel_videos_short_id();

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_posts_short_id          ON public.posts(short_id);
CREATE INDEX IF NOT EXISTS idx_articles_short_id       ON public.articles(short_id);
CREATE INDEX IF NOT EXISTS idx_channel_videos_short_id ON public.channel_videos(short_id);

-- Make NOT NULL after backfill + trigger
ALTER TABLE public.posts          ALTER COLUMN short_id SET NOT NULL;
ALTER TABLE public.articles       ALTER COLUMN short_id SET NOT NULL;
ALTER TABLE public.channel_videos ALTER COLUMN short_id SET NOT NULL;