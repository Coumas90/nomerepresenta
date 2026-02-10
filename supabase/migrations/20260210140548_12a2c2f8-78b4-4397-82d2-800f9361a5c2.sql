
-- Add per-image metadata fields to artwork_images
ALTER TABLE public.artwork_images
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS year TEXT,
  ADD COLUMN IF NOT EXISTS dimensions TEXT,
  ADD COLUMN IF NOT EXISTS materials TEXT,
  ADD COLUMN IF NOT EXISTS is_detail BOOLEAN NOT NULL DEFAULT false;
