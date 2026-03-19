CREATE TABLE public.sold_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sold_artwork_id uuid NOT NULL REFERENCES public.sold_artworks(id) ON DELETE CASCADE,
  installment_number integer NOT NULL DEFAULT 1,
  due_date date DEFAULT NULL,
  amount numeric DEFAULT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_date date DEFAULT NULL,
  notes text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(sold_artwork_id, installment_number)
);

ALTER TABLE public.sold_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage installments" ON public.sold_installments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));