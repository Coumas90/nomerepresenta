
-- Make fields optional (nullable)
ALTER TABLE public.artworks ALTER COLUMN year DROP NOT NULL;
ALTER TABLE public.artworks ALTER COLUMN dimensions DROP NOT NULL;
ALTER TABLE public.artworks ALTER COLUMN materials DROP NOT NULL;
ALTER TABLE public.artworks ALTER COLUMN image_detail_url DROP NOT NULL;

-- Set default empty strings for fields that currently require values
ALTER TABLE public.artworks ALTER COLUMN year SET DEFAULT '';
ALTER TABLE public.artworks ALTER COLUMN dimensions SET DEFAULT '';
ALTER TABLE public.artworks ALTER COLUMN materials SET DEFAULT '';
ALTER TABLE public.artworks ALTER COLUMN image_detail_url SET DEFAULT '';

-- Drop technique column (redundant with materials)
ALTER TABLE public.artworks DROP COLUMN technique;
