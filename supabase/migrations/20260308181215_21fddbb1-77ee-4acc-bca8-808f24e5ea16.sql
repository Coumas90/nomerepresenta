
ALTER TABLE public.pricelist_items ADD COLUMN price_usd text DEFAULT '';
ALTER TABLE public.pricelist_items ADD COLUMN price_eur text DEFAULT '';
ALTER TABLE public.pricelist_items ADD COLUMN price_brl text DEFAULT '';

ALTER TABLE public.pricelists ADD COLUMN active_currency text DEFAULT 'USD';
