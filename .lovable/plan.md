

## Plano: Blog e Admin com Editor Rico + SEO Completo

### Problema Atual
- Todos os formulários admin (blog, tutoriais, impressoras, softwares, drivers) usam `<Textarea>` simples — texto puro, sem formatação
- Sem campos de SEO (meta title, meta description, meta keywords)
- Sem editor rico: sem H1/H2/H3, sem bullet points, sem inserção de imagens inline, sem colar HTML/script
- Páginas de detalhe renderizam conteúdo como texto puro (`whitespace-pre-wrap`)
- Blog não tem página de detalhe individual (`/blog/:slug`)

### Solução

#### 1. Instalar Editor Rico (TipTap)
- Adicionar `@tiptap/react`, `@tiptap/starter-kit`, extensões para imagens, links, headings
- Criar componente `RichTextEditor` reutilizável com toolbar visual:
  - **Headings**: H1, H2, H3
  - **Formatação**: Negrito, Itálico, Sublinhado
  - **Listas**: Bullet points, listas numeradas
  - **Mídia**: Inserir imagem (upload via storage ou URL)
  - **Links**: Inserir/editar links
  - **HTML**: Botão para alternar entre visual e código-fonte (colar scripts/HTML)
- O editor salva HTML no banco; as páginas de detalhe renderizam HTML sanitizado

#### 2. Adicionar Campos SEO na Tabela `blog_posts`
- Migration: adicionar colunas `meta_title`, `meta_description`, `meta_keywords` (todos `text`, nullable)
- Mesma migration para tabela `tutorials`: adicionar `meta_title`, `meta_description`, `meta_keywords`
- Mesma migration para `printers`: adicionar `meta_title`, `meta_description`, `meta_keywords`, `conteudo` (HTML rico para descrição completa)
- Mesma migration para `softwares`: adicionar `meta_title`, `meta_description`, `meta_keywords`, `conteudo`
- Mesma migration para `drivers`: adicionar `meta_title`, `meta_description`, `meta_keywords`, `conteudo`

#### 3. Atualizar Todos os Formulários Admin
Cada formulário admin ganha:
- **Seção SEO** (colapsável): Meta Title, Meta Description, Meta Keywords
- **Editor Rico** no lugar do Textarea para conteúdo/descrição
- Blog e Tutoriais: editor rico no campo "Conteúdo"
- Impressoras, Softwares, Drivers: editor rico no campo "Descrição" (que vira "Conteúdo")

#### 4. Criar Página de Detalhe do Blog (`/blog/:slug`)
- Nova rota `/blog/:slug` → `BlogPostDetailPage`
- SEO completo: usa `meta_title` ou `titulo`, `meta_description` ou `resumo`, `meta_keywords`
- JSON-LD com schema Article
- Renderização do HTML do editor com `dangerouslySetInnerHTML` + sanitização (DOMPurify)
- Sidebar com posts relacionados da mesma categoria

#### 5. Atualizar BlogPage (listagem)
- Buscar posts publicados do banco
- Exibir cards com imagem de capa, título, resumo, categoria, data
- Links para `/blog/:slug`

#### 6. Atualizar Páginas de Detalhe Existentes
- `TutorialDetailPage`, `PrinterDetailPage`, `SoftwareDetailPage`, `DriverDetailPage`:
  - Renderizar conteúdo como HTML (não mais `whitespace-pre-wrap`)
  - Usar meta tags SEO dos campos do banco
  - Adicionar `meta keywords` ao `SEOHead`

#### 7. Atualizar `SEOHead` Component
- Adicionar suporte a `keywords` (meta tag)
- Adicionar Open Graph tags (`og:title`, `og:description`, `og:image`)

### Arquivos Afetados
- **Novos**: `src/components/admin/RichTextEditor.tsx`, `src/pages/BlogPostDetailPage.tsx`
- **Migration**: 1 migration SQL com todas as colunas novas
- **Editados**: `AdminBlog.tsx`, `AdminTutorials.tsx`, `AdminPrinters.tsx`, `AdminSoftwares.tsx`, `AdminDrivers.tsx`, `BlogPage.tsx`, `TutorialDetailPage.tsx`, `PrinterDetailPage.tsx`, `SoftwareDetailPage.tsx`, `DriverDetailPage.tsx`, `SEOHead.tsx`, `App.tsx`
- **Dependências**: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-underline`, `@tiptap/extension-text-align`, `@tiptap/extension-placeholder`, `dompurify`

