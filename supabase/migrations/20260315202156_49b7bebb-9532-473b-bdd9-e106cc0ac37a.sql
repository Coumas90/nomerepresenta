
-- Create sold_artworks table
CREATE TABLE public.sold_artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  date_sold date,
  sale_price numeric,
  currency text DEFAULT 'USD',
  payment_status text DEFAULT 'pending',
  installment_count integer,
  installment_start_date date,
  installment_end_date date,
  collector_name text,
  collector_type text,
  collector_city text,
  collector_country text,
  collector_email text,
  collector_phone text,
  sold_through text,
  gallery_name text,
  commission_percentage numeric,
  invoice_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sold_artworks ENABLE ROW LEVEL SECURITY;

-- RLS policies - admin only (sensitive data)
CREATE POLICY "Admins can view sold artworks" ON public.sold_artworks
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert sold artworks" ON public.sold_artworks
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sold artworks" ON public.sold_artworks
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sold artworks" ON public.sold_artworks
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger
CREATE TRIGGER handle_sold_artworks_updated_at
  BEFORE UPDATE ON public.sold_artworks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Invoice storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);

-- Storage policies for invoices - admin only
CREATE POLICY "Admins can upload invoices" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view invoices" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invoices" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update invoices" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));
