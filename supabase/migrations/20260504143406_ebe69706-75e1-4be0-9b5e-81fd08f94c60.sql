-- Remove TipTap <p> wrappers around block elements in BPX520 driver
UPDATE public.drivers 
SET conteudo = regexp_replace(
  regexp_replace(conteudo, '<p><(h[1-6]|ul|ol|li|hr|pre|blockquote|div|table)', '<\1', 'g'),
  '</(h[1-6]|ul|ol|li|hr|pre|blockquote|div|table)></p>', '</\1>', 'g'
)
WHERE conteudo LIKE '%<p><h%' OR conteudo LIKE '%<p><ul%' OR conteudo LIKE '%<p><li%' OR conteudo LIKE '%<p><pre%';