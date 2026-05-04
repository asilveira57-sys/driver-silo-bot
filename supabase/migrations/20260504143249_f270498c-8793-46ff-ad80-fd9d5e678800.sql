-- Fix double-escaped HTML in drivers table (BPX 520)
UPDATE public.drivers 
SET conteudo = regexp_replace(
  regexp_replace(
    regexp_replace(conteudo, '<p>(&lt;[^&]*&gt;)</p>', '\1', 'g'),
    '&lt;', '<', 'g'
  ),
  '&gt;', '>', 'g'
)
WHERE conteudo LIKE '%&lt;%';