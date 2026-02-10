
-- Create bio_settings table for managing bio page content
CREATE TABLE public.bio_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bio_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read bio settings (public page)
CREATE POLICY "Anyone can view bio settings"
ON public.bio_settings FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert bio settings"
ON public.bio_settings FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update bio settings"
ON public.bio_settings FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete bio settings"
ON public.bio_settings FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_bio_settings_updated_at
BEFORE UPDATE ON public.bio_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Seed with default bio image
INSERT INTO public.bio_settings (key, value) VALUES ('bio_hero_image', '');
