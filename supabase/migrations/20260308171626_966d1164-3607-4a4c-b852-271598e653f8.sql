
-- Create pricelists parent table
CREATE TABLE public.pricelists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  password text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricelists ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view pricelists" ON public.pricelists FOR SELECT USING (true);
CREATE POLICY "Admins can insert pricelists" ON public.pricelists FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pricelists" ON public.pricelists FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pricelists" ON public.pricelists FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER set_pricelists_updated_at
  BEFORE UPDATE ON public.pricelists
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert a default pricelist and migrate existing items
INSERT INTO public.pricelists (id, name, slug, password)
VALUES ('00000000-0000-0000-0000-000000000001', 'Main Pricelist', 'main', 'ivan123');

-- Add pricelist_id column to pricelist_items
ALTER TABLE public.pricelist_items
  ADD COLUMN pricelist_id uuid REFERENCES public.pricelists(id) ON DELETE CASCADE;

-- Migrate existing items to default pricelist
UPDATE public.pricelist_items SET pricelist_id = '00000000-0000-0000-0000-000000000001' WHERE pricelist_id IS NULL;

-- Make it NOT NULL after migration
ALTER TABLE public.pricelist_items ALTER COLUMN pricelist_id SET NOT NULL;
ALTER TABLE public.pricelist_items ALTER COLUMN pricelist_id SET DEFAULT '00000000-0000-0000-0000-000000000001';

-- Drop the unique constraint on artwork_id since same artwork can be in multiple pricelists
ALTER TABLE public.pricelist_items DROP CONSTRAINT IF EXISTS pricelist_items_artwork_id_fkey;
ALTER TABLE public.pricelist_items ADD CONSTRAINT pricelist_items_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id) ON DELETE CASCADE;

-- Add unique constraint per pricelist
ALTER TABLE public.pricelist_items ADD CONSTRAINT pricelist_items_pricelist_artwork_unique UNIQUE (pricelist_id, artwork_id);
