

## Rebranding: Alinhar identidade visual com adeconex.com.br

### Problema
As cores atuais do site são azul e amarelo, mas a marca Adeconex usa **vermelho bordô/carmesim** como cor principal, com branco de fundo e preto de texto — conforme visível no site de referência.

### Cores extraídas do site de referência
- **Primária (bordô):** `#9B1B30` (vermelho escuro/bordô)
- **Destaque/CTA:** `#C41E3A` (vermelho mais vivo para botões)
- **Fundo:** `#FFFFFF` branco
- **Texto:** `#1A1A1A` preto
- **Top bar/Nav:** Fundo bordô escuro `#7A1525`
- **Acentos:** Tons de vermelho claro para hovers

### Arquivos a alterar

**1. `src/index.css` — Substituir tokens de cor**
- `--primary`: de azul `213 80% 45%` → bordô ~`348 70% 36%`
- `--secondary`: de amarelo → vermelho mais vivo ~`350 75% 45%`
- `--accent`: de azul claro → rosa/bordô claro
- `--hero-gradient`: gradiente bordô
- `--cta-gradient`: gradiente vermelho CTA
- `--sidebar-*`: tons bordô escuro
- `--ring`: bordô

**2. `tailwind.config.ts` — Sem alteração estrutural**
Os tokens CSS custom properties já são referenciados via `hsl(var(...))`, então basta mudar os valores no CSS.

**3. `src/components/layout/Header.tsx`**
- Classe `hero-gradient` no logo já seguirá a nova cor automaticamente via CSS.

**4. `src/components/layout/Footer.tsx`**
- Já usa `hero-gradient` e `text-secondary`, seguirá automaticamente.

**5. Cards e botões**
- `download-btn` e `cta-gradient` já referenciam CSS custom props — mudam automaticamente.

**6. Atualizar `mem://design/tokens` e `mem://index.md`**
- Corrigir a referência de "Blue/Yellow" para "Bordô/Vermelho".

### Resumo
A alteração é centralizada: trocar ~15 variáveis CSS em `src/index.css`. Todos os componentes já consomem essas variáveis, então a mudança propaga automaticamente por todo o site.

