
-- blog_posts: add SEO fields
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_keywords text;

-- tutorials: add SEO fields
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS meta_keywords text;

-- printers: add SEO fields + rich content
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS conteudo text;

-- softwares: add SEO fields + rich content
ALTER TABLE public.softwares ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.softwares ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.softwares ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE public.softwares ADD COLUMN IF NOT EXISTS conteudo text;

-- drivers: add SEO fields + rich content
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS meta_keywords text;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS conteudo text;
