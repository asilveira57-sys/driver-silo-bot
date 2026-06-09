
CREATE TABLE public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  descricao text NOT NULL,
  categoria text NOT NULL DEFAULT 'geral',
  icone text,
  meta_title text,
  meta_description text,
  keywords text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tools TO anon, authenticated;
GRANT ALL ON public.tools TO service_role, authenticated;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tools publicly readable when active" ON public.tools FOR SELECT USING (ativo = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage tools" ON public.tools FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER tools_set_updated BEFORE UPDATE ON public.tools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.tool_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug text NOT NULL,
  action text NOT NULL,
  metadata jsonb,
  user_agent text,
  device_type text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.tool_usage_logs TO anon, authenticated;
GRANT ALL ON public.tool_usage_logs TO service_role;
ALTER TABLE public.tool_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert tool logs" ON public.tool_usage_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read tool logs" ON public.tool_usage_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_tool_usage_logs_slug ON public.tool_usage_logs(tool_slug, created_at DESC);

INSERT INTO public.tools (slug, nome, descricao, categoria, icone, meta_title, meta_description, keywords, ordem) VALUES
('gerador-qrcode', 'Gerador de QR Code', 'Crie QR Codes personalizados gratuitamente com logo, cores e exporte em PNG, JPG, PDF ou SVG.', 'utilitarios', 'QrCode',
 'Gerador de QR Code Gratuito com Logo | Adeconex',
 'Crie QR Codes personalizados gratuitamente. Adicione logotipo, altere tamanho, exporte em PNG, JPG ou PDF e utilize em produtos, cartões, etiquetas e materiais gráficos.',
 'gerador qr code, criar qr code, qr code personalizado, qr code com logo, gerador qr code online, qr code png, qr code pdf, qr code para empresas',
 1);
