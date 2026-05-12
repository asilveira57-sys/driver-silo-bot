import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = "Adeconex Drivers";
const DEFAULT_OG_IMAGE = "https://www.adeconex.com/og-default.jpg";

export function SEOHead({
  title,
  description,
  canonical,
  keywords,
  ogImage,
  ogType = "website",
  noindex = false,
  jsonLd,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = `${title} | Adeconex`;

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!content) { el?.remove(); return; }
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const image = ogImage || DEFAULT_OG_IMAGE;

    setMeta("description", description);
    setMeta("keywords", keywords || "");
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMeta("googlebot", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:locale", "pt_BR", "property");
    if (canonical) setMeta("og:url", canonical, "property");
    setMeta("og:image", image, "property");

    // Twitter
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", title, "name");
    setMeta("twitter:description", description, "name");
    setMeta("twitter:image", image, "name");

    // Canonical
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
      link.href = canonical;
    } else if (link) { link.remove(); }

    // JSON-LD (supports array)
    document.querySelectorAll('script[data-seo="jsonld"]').forEach((s) => s.remove());
    if (jsonLd) {
      const arr = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      arr.forEach((obj) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo", "jsonld");
        script.textContent = JSON.stringify(obj);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.querySelectorAll('script[data-seo="jsonld"]').forEach((s) => s.remove());
    };
  }, [title, description, canonical, keywords, ogImage, ogType, noindex, jsonLd]);

  return null;
}
