import { useMemo } from "react";
import { AdSlot } from "./AdSlot";

type Props = {
  html: string;
  pageType?: string;
  slot?: string;
  /** Mínimo de palavras para inserir o anúncio intermediário. Padrão 800. */
  minWords?: number;
  /** Inserir após o N-ésimo parágrafo. Padrão 3. */
  afterParagraph?: number;
  className?: string;
};

const BLOCK_TAGS = ["ul", "ol", "table", "pre", "code", "details", "blockquote"];

/**
 * Renderiza conteúdo HTML do artigo e insere automaticamente um anúncio
 * intermediário após o N-ésimo parágrafo, somente se o texto tiver
 * mais palavras que `minWords`. Pula listas, tabelas, código e FAQs.
 */
export function ArticleWithMidAd({
  html,
  pageType,
  slot,
  minWords = 800,
  afterParagraph = 3,
  className = "",
}: Props) {
  const parts = useMemo(() => {
    if (!html) return { before: "", after: "", insert: false };
    const text = html.replace(/<[^>]*>/g, " ");
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < minWords) return { before: html, after: "", insert: false };

    // Encontra parágrafos top-level (que não estão dentro de blocos restritos)
    if (typeof DOMParser === "undefined") {
      return { before: html, after: "", insert: false };
    }
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.body.firstChild as HTMLElement | null;
    if (!root) return { before: html, after: "", insert: false };

    const paragraphs = Array.from(root.children).filter((el) => {
      const tag = el.tagName.toLowerCase();
      if (tag !== "p") return false;
      // ignora parágrafos dentro de listas etc. (já são filtros top-level)
      return !BLOCK_TAGS.includes(tag);
    });

    if (paragraphs.length < afterParagraph) {
      return { before: html, after: "", insert: false };
    }

    const target = paragraphs[afterParagraph - 1] as HTMLElement;
    const marker = doc.createElement("div");
    marker.setAttribute("data-mid-ad", "1");
    target.parentNode?.insertBefore(marker, target.nextSibling);

    const fullHtml = root.innerHTML;
    const [before, after] = fullHtml.split(/<div data-mid-ad="1"><\/div>/);
    return { before: before || "", after: after || "", insert: true };
  }, [html, minWords, afterParagraph]);

  const proseClasses =
    "prose prose-slate max-w-none text-foreground [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_a]:text-primary";

  if (!parts.insert) {
    return <div className={`${proseClasses} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className={className}>
      <div className={proseClasses} dangerouslySetInnerHTML={{ __html: parts.before }} />
      <AdSlot position="mid" pageType={pageType} slot={slot} minHeight={250} />
      <div className={proseClasses} dangerouslySetInnerHTML={{ __html: parts.after }} />
    </div>
  );
}
