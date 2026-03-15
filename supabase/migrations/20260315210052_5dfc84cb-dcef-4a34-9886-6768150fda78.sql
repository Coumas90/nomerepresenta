
-- Invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  seller_name text DEFAULT 'Ivan Comas',
  seller_address text DEFAULT '',
  buyer_name text DEFAULT '',
  buyer_address text DEFAULT '',
  conditions text DEFAULT '',
  total_price numeric DEFAULT 0,
  currency text DEFAULT 'BRL',
  magic_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),
  status text DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Invoice artworks junction
CREATE TABLE public.invoice_artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  artwork_id uuid REFERENCES public.artworks(id) NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Invoice line items
CREATE TABLE public.invoice_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Admin policies for invoices
CREATE POLICY "Admins can view invoices" ON public.invoices FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete invoices" ON public.invoices FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Public access via magic token
CREATE POLICY "Public can view invoices via magic token" ON public.invoices FOR SELECT TO anon USING (true);

-- Admin policies for invoice_artworks
CREATE POLICY "Admins can manage invoice artworks" ON public.invoice_artworks FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view invoice artworks" ON public.invoice_artworks FOR SELECT TO anon USING (true);

-- Admin policies for invoice_line_items
CREATE POLICY "Admins can manage invoice line items" ON public.invoice_line_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Public can view invoice line items" ON public.invoice_line_items FOR SELECT TO anon USING (true);

-- Updated_at trigger
CREATE TRIGGER handle_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-increment helper function
CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    '#' || (MAX(NULLIF(REPLACE(invoice_number, '#', ''), '')::integer) + 1)::text,
    '#1'
  )
  FROM public.invoices
$$;
