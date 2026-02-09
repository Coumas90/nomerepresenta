
-- Add series_id to studio_images (nullable so existing images aren't broken)
ALTER TABLE public.studio_images
ADD COLUMN series_id uuid REFERENCES public.series(id) ON DELETE SET NULL;

-- Index for fast lookups
CREATE INDEX idx_studio_images_series_id ON public.studio_images(series_id);
