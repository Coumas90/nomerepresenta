-- Create table for studio images
CREATE TABLE public.studio_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.studio_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view studio images" 
ON public.studio_images 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert studio images" 
ON public.studio_images 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update studio images" 
ON public.studio_images 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete studio images" 
ON public.studio_images 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_studio_images_updated_at
BEFORE UPDATE ON public.studio_images
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();