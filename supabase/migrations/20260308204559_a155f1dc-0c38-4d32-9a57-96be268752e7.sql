
-- Add catalog fields to artworks table
ALTER TABLE public.artworks
  ADD COLUMN IF NOT EXISTS size_category text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS medium_type text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS location text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;
