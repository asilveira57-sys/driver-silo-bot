
CREATE TABLE public.short_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  original_url text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  last_click_at timestamptz,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_short_links_code ON public.short_links(code);

GRANT SELECT, INSERT ON public.short_links TO anon, authenticated;
GRANT ALL ON public.short_links TO service_role;
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read short links" ON public.short_links FOR SELECT USING (true);
CREATE POLICY "Anyone can create short links" ON public.short_links FOR INSERT WITH CHECK (true);

CREATE TABLE public.short_link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  source text NOT NULL DEFAULT 'direto',
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_short_link_clicks_code ON public.short_link_clicks(code, created_at DESC);

GRANT SELECT, INSERT ON public.short_link_clicks TO anon, authenticated;
GRANT ALL ON public.short_link_clicks TO service_role;
ALTER TABLE public.short_link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read clicks" ON public.short_link_clicks FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clicks" ON public.short_link_clicks FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.register_short_link_click(_code text, _source text, _user_agent text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.short_links
     SET clicks = clicks + 1, last_click_at = now()
   WHERE code = _code;
  INSERT INTO public.short_link_clicks(code, source, user_agent)
       VALUES (_code, COALESCE(NULLIF(_source,''), 'direto'), _user_agent);
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_short_link_click(text, text, text) TO anon, authenticated;
