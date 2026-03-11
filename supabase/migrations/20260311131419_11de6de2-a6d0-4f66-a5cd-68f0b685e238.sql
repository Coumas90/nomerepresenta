
-- Create works_blocks table
CREATE TABLE public.works_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  block_type text NOT NULL DEFAULT 'single',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create works_block_items table
CREATE TABLE public.works_block_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid NOT NULL REFERENCES public.works_blocks(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for works_blocks
ALTER TABLE public.works_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view works blocks" ON public.works_blocks FOR SELECT USING (true);
CREATE POLICY "Admins can insert works blocks" ON public.works_blocks FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update works blocks" ON public.works_blocks FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete works blocks" ON public.works_blocks FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS for works_block_items
ALTER TABLE public.works_block_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view works block items" ON public.works_block_items FOR SELECT USING (true);
CREATE POLICY "Admins can insert works block items" ON public.works_block_items FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update works block items" ON public.works_block_items FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete works block items" ON public.works_block_items FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger
CREATE TRIGGER handle_works_blocks_updated_at
  BEFORE UPDATE ON public.works_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Migrate existing artworks to works_blocks (one block per artwork)
DO $$
DECLARE
  r RECORD;
  new_block_id uuid;
BEGIN
  FOR r IN
    SELECT id, series_id, display_order
    FROM public.artworks
    ORDER BY series_id, display_order
  LOOP
    INSERT INTO public.works_blocks (series_id, block_type, display_order)
    VALUES (r.series_id, 'single', r.display_order)
    RETURNING id INTO new_block_id;
    
    INSERT INTO public.works_block_items (block_id, artwork_id, display_order)
    VALUES (new_block_id, r.id, 0);
  END LOOP;
END $$;
