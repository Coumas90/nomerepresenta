
-- Table for CV entries (education, exhibitions, etc.)
CREATE TABLE public.bio_cv_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL, -- 'education', 'solo_exhibitions', 'group_exhibitions'
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  venue TEXT, -- e.g. ", Steve Turner, Los Angeles"
  link TEXT, -- optional URL
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bio_cv_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view CV entries" ON public.bio_cv_entries FOR SELECT USING (true);
CREATE POLICY "Admins can insert CV entries" ON public.bio_cv_entries FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update CV entries" ON public.bio_cv_entries FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete CV entries" ON public.bio_cv_entries FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_bio_cv_entries_updated_at
  BEFORE UPDATE ON public.bio_cv_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
