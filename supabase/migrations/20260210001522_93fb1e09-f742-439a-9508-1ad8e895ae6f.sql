-- Drop the duplicate foreign key constraint to resolve the ambiguous relationship
ALTER TABLE public.studio_images DROP CONSTRAINT IF EXISTS studio_images_studio_series_id_fkey;