-- Create artwork_images table for multiple images per artwork
CREATE TABLE public.artwork_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_artwork_images_artwork_id ON public.artwork_images(artwork_id);
CREATE INDEX idx_artwork_images_order ON public.artwork_images(artwork_id, display_order);

-- Enable RLS
ALTER TABLE public.artwork_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view artwork images"
  ON public.artwork_images 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert artwork images"
  ON public.artwork_images 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update artwork images"
  ON public.artwork_images 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete artwork images"
  ON public.artwork_images 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing images from artworks table
INSERT INTO public.artwork_images (artwork_id, image_url, display_order, is_main)
SELECT id, image_url, 1, true 
FROM public.artworks 
WHERE image_url IS NOT NULL AND image_url != '';

INSERT INTO public.artwork_images (artwork_id, image_url, display_order, is_main)
SELECT id, image_detail_url, 2, false 
FROM public.artworks 
WHERE image_detail_url IS NOT NULL AND image_detail_url != '';