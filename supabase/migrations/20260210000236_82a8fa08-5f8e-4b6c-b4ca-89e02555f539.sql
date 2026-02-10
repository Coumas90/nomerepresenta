
-- Create independent studio_series table
CREATE TABLE public.studio_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.studio_series ENABLE ROW LEVEL SECURITY;

-- RLS policies (mirror series table)
CREATE POLICY "Anyone can view studio series" ON public.studio_series FOR SELECT USING (true);
CREATE POLICY "Admins can insert studio series" ON public.studio_series FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update studio series" ON public.studio_series FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete studio series" ON public.studio_series FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_studio_series_updated_at
BEFORE UPDATE ON public.studio_series
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add new FK column to studio_images pointing to studio_series
ALTER TABLE public.studio_images ADD COLUMN studio_series_id UUID REFERENCES public.studio_series(id);

-- Migrate existing data: copy series used by studio_images into studio_series
INSERT INTO public.studio_series (id, name, description, display_order, created_at, updated_at)
SELECT DISTINCT s.id, s.name, s.description, s.display_order, s.created_at, s.updated_at
FROM public.series s
INNER JOIN public.studio_images si ON si.series_id = s.id;

-- Point studio_images to the new column
UPDATE public.studio_images SET studio_series_id = series_id WHERE series_id IS NOT NULL;

-- Drop old FK and column
ALTER TABLE public.studio_images DROP CONSTRAINT IF EXISTS studio_images_series_id_fkey;
ALTER TABLE public.studio_images DROP COLUMN series_id;

-- Rename new column to series_id
ALTER TABLE public.studio_images RENAME COLUMN studio_series_id TO series_id;

-- Add FK constraint
ALTER TABLE public.studio_images ADD CONSTRAINT studio_images_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.studio_series(id);
