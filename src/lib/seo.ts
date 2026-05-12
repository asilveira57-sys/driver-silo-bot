// Helpers SEO institucionais Adeconex

export const SITE_URL = "https://www.adeconex.com";
export const SITE_NAME = "Adeconex Drivers";
export const ORG_NAME = "Adeconex";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ORG_NAME,
  alternateName: "Adeconex Etiquetas",
  url: "https://www.adeconex.com.br",
  logo: `${SITE_URL}/favicon.ico`,
  email: "vendas@adeconex.com.br",
  telephone: "+55-27-3318-6565",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Vila Velha",
    addressRegion: "ES",
    addressCountry: "BR",
  },
  sameAs: ["https://www.adeconex.com", "https://www.adeconex.com.br"],
  description:
    "Adeconex: soluções em impressão térmica, etiquetas adesivas, ribbons, drivers, softwares e suporte técnico para automação comercial.",
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "pt-BR",
  publisher: { "@type": "Organization", name: ORG_NAME },
};

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
