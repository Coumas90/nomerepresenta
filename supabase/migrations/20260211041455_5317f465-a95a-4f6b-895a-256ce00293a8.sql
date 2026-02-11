
ALTER TABLE public.series ADD COLUMN is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.artworks ADD COLUMN is_visible boolean NOT NULL DEFAULT true;
