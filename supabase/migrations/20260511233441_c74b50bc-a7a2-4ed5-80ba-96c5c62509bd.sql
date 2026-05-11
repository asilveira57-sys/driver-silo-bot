CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  site_url text NOT NULL DEFAULT 'https://www.adeconex.com',
  meta_title text,
  meta_description text,
  meta_keywords text,
  og_image_url text,
  ga_id text,
  robots_txt text NOT NULL DEFAULT E'User-agent: *\nAllow: /\n\nSitemap: https://www.adeconex.com/sitemap.xml\n',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site_settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert site_settings"
ON public.site_settings FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site_settings"
ON public.site_settings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (singleton) VALUES (true);