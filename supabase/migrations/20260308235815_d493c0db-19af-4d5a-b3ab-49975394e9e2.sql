
-- ============================================
-- SHOWS content type
-- ============================================

CREATE TABLE public.shows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  year text NOT NULL DEFAULT '',
  subtitle text,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  show_in_menu boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published shows" ON public.shows
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert shows" ON public.shows
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update shows" ON public.shows
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shows" ON public.shows
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_shows_updated_at
  BEFORE UPDATE ON public.shows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SHOW IMAGES gallery
-- ============================================

CREATE TABLE public.show_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id uuid NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  caption text,
  alt_text text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.show_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view show images" ON public.show_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert show images" ON public.show_images
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update show images" ON public.show_images
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete show images" ON public.show_images
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- SITE SETTINGS — generic key/value for nav visibility etc.
-- ============================================

CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site settings" ON public.site_settings
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed default setting for shows visibility
INSERT INTO public.site_settings (key, value) VALUES ('shows_visible_in_menu', 'false');
