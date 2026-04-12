
-- Create drivers table
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  nome TEXT NOT NULL,
  versao TEXT NOT NULL,
  sistema_operacional TEXT NOT NULL,
  link_download TEXT NOT NULL,
  data_publicacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create printers table
CREATE TABLE public.printers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  descricao TEXT,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create softwares table
CREATE TABLE public.softwares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  link_download TEXT NOT NULL,
  versao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tutorials table
CREATE TABLE public.tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  conteudo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  link_produto TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create download_logs table
CREATE TABLE public.download_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  user_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.softwares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies for content tables
CREATE POLICY "Anyone can read drivers" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Anyone can read printers" ON public.printers FOR SELECT USING (true);
CREATE POLICY "Anyone can read softwares" ON public.softwares FOR SELECT USING (true);
CREATE POLICY "Anyone can read tutorials" ON public.tutorials FOR SELECT USING (true);
CREATE POLICY "Anyone can read materials" ON public.materials FOR SELECT USING (true);

-- Public insert for download logs
CREATE POLICY "Anyone can log downloads" ON public.download_logs FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_drivers_marca ON public.drivers(marca);
CREATE INDEX idx_drivers_modelo ON public.drivers(modelo);
CREATE INDEX idx_drivers_ativo ON public.drivers(ativo);
CREATE INDEX idx_printers_marca ON public.printers(marca);
CREATE INDEX idx_printers_modelo ON public.printers(modelo);
CREATE INDEX idx_tutorials_slug ON public.tutorials(slug);
CREATE INDEX idx_tutorials_categoria ON public.tutorials(categoria);
CREATE INDEX idx_materials_categoria ON public.materials(categoria);
CREATE INDEX idx_download_logs_driver_id ON public.download_logs(driver_id);
