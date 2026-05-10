ALTER TABLE public.posts          ALTER COLUMN short_id DROP NOT NULL;
ALTER TABLE public.articles       ALTER COLUMN short_id DROP NOT NULL;
ALTER TABLE public.channel_videos ALTER COLUMN short_id DROP NOT NULL;