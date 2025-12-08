-- Create the artwork-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'artwork-images', 
  'artwork-images', 
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
);

-- Public read access for artwork images
CREATE POLICY "Public read access for artwork images"
ON storage.objects FOR SELECT
USING (bucket_id = 'artwork-images');

-- Admin upload access for artwork images
CREATE POLICY "Admin upload access for artwork images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'artwork-images' 
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin')
);

-- Admin update access for artwork images
CREATE POLICY "Admin update access for artwork images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'artwork-images'
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin')
);

-- Admin delete access for artwork images
CREATE POLICY "Admin delete access for artwork images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'artwork-images'
  AND auth.role() = 'authenticated'
  AND public.has_role(auth.uid(), 'admin')
);