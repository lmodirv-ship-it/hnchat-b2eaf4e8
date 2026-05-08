ALTER TABLE articles DROP CONSTRAINT articles_language_check;
ALTER TABLE articles ADD CONSTRAINT articles_language_check CHECK (language = ANY (ARRAY['ar', 'fr', 'en', 'es']));