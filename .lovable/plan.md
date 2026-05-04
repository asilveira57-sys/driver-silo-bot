## Problema

O editor rico (RichTextEditor) tem um modo "Código Fonte HTML" (botão FileCode), mas:

1. **HTML colado não é salvo** — Se você cola HTML no campo de código-fonte e clica "Salvar" sem voltar ao modo visual, o HTML não é enviado ao formulário (o `onChange` só dispara ao alternar de volta)
2. **Atributo `alt` nas imagens é perdido** — A extensão Image do TipTap não está configurada para preservar o atributo `alt`, essencial para SEO
3. **Alguns elementos HTML podem ser removidos** — O TipTap limpa tags que não fazem parte do seu schema (ex: `<table>`, `<iframe>`)

## Solução

### 1. Sincronizar modo código-fonte em tempo real
- O textarea do modo fonte vai chamar `onChange(sourceCode)` a cada alteração, não apenas ao alternar de volta
- Isso garante que colar HTML e clicar Salvar funcione corretamente

### 2. Suporte a `alt` e `title` em imagens
- Configurar a extensão Image do TipTap para aceitar atributos `alt` e `title`
- Adicionar campo de `alt` no input de inserção de imagem (URL e upload)
- Imagens coladas via HTML preservarão seus atributos `alt`

### 3. Melhorar a experiência do modo fonte
- Adicionar indicação visual clara de quando está no modo fonte (destaque/badge)
- O editor vai aceitar HTML arbitrário no modo fonte — ao voltar ao visual, o TipTap renderiza o que consegue, mas o HTML original é preservado no campo `conteudo`

## Arquivos alterados

- `src/components/admin/RichTextEditor.tsx` — todas as correções acima

## Impacto

Funciona em todos os cadastros que já usam o RichTextEditor: Blog, Impressoras, Drivers, Softwares, Tutoriais e Materiais.
