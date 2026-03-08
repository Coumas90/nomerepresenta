
CREATE TABLE public.pricelist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  price text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(artwork_id)
);

ALTER TABLE public.pricelist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricelist items" ON public.pricelist_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert pricelist items" ON public.pricelist_items
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pricelist items" ON public.pricelist_items
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pricelist items" ON public.pricelist_items
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER handle_pricelist_items_updated_at
  BEFORE UPDATE ON public.pricelist_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
