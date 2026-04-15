
ALTER TABLE public.materials
ADD COLUMN meta_title text,
ADD COLUMN meta_description text,
ADD COLUMN meta_keywords text,
ADD COLUMN conteudo text,
ADD COLUMN slug text;

CREATE UNIQUE INDEX idx_materials_slug ON public.materials(slug);
