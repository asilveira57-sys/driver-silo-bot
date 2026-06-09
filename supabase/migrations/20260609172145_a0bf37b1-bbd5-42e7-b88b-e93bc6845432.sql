
CREATE TABLE public.adsense_render_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_type TEXT,
  position TEXT,
  device TEXT,
  status TEXT,
  load_time_ms INTEGER,
  ad_blocker_detected BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.adsense_render_logs TO anon, authenticated;
GRANT ALL ON public.adsense_render_logs TO service_role;
ALTER TABLE public.adsense_render_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert render logs" ON public.adsense_render_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read render logs" ON public.adsense_render_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.adsense_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT NOT NULL,
  page_type TEXT,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC,
  estimated_rpm NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.adsense_metrics TO authenticated;
GRANT SELECT, INSERT ON public.adsense_metrics TO anon;
GRANT ALL ON public.adsense_metrics TO service_role;
ALTER TABLE public.adsense_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert metrics" ON public.adsense_metrics FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read metrics" ON public.adsense_metrics FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
