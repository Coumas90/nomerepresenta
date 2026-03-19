
-- Create works_sections table for independent Works page organization
CREATE TABLE public.works_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.works_sections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view works sections" ON public.works_sections FOR SELECT USING (true);
CREATE POLICY "Admins can insert works sections" ON public.works_sections FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update works sections" ON public.works_sections FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete works sections" ON public.works_sections FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add section_id to works_blocks (nullable for migration, will replace series_id)
ALTER TABLE public.works_blocks ADD COLUMN section_id uuid REFERENCES public.works_sections(id) ON DELETE CASCADE;

-- Migrate existing data: create a works_section for each series that has blocks
INSERT INTO public.works_sections (id, name, display_order, is_visible)
SELECT DISTINCT s.id, s.name, s.display_order, s.is_visible
FROM public.series s
INNER JOIN public.works_blocks wb ON wb.series_id = s.id;

-- Set section_id to match series_id for existing blocks
UPDATE public.works_blocks SET section_id = series_id WHERE series_id IS NOT NULL;
