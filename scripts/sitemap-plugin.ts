import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import type { Plugin } from "vite";

const BASE_URL = "https://www.adeconex.com";
const SUPABASE_URL = "https://kxxomoiballvvuoluhad.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eG9tb2liYWxsdnZ1b2x1aGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTUyMDMsImV4cCI6MjA5MTU3MTIwM30.YAYUhwWKg18iEK14zuWuzNGPLRS-pL-fLnIQFZaXsgk";

type Entry = { loc: string; lastmod?: string; changefreq: string; priority: string };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function fetchTable(table: string, select: string, filter = ""): Promise<any[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}`;
  try {
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!res.ok) return [];
    return (await res.json()) as any[];
  } catch {
    return [];
  }
}

function buildXml(entries: Entry[]): string {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries.map((e) =>
      [
        `  <url>`,
        `    <loc>${BASE_URL}${e.loc}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        `  </url>`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    `</urlset>`,
  ].join("\n");
}

async function generate(): Promise<string> {
  const entries: Entry[] = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/blog", priority: "0.9", changefreq: "daily" },
    { loc: "/impressoras", priority: "0.8", changefreq: "weekly" },
    { loc: "/drivers", priority: "0.8", changefreq: "weekly" },
    { loc: "/softwares", priority: "0.8", changefreq: "weekly" },
    { loc: "/tutoriais", priority: "0.8", changefreq: "weekly" },
    { loc: "/materiais", priority: "0.8", changefreq: "weekly" },
    { loc: "/downloads", priority: "0.7", changefreq: "weekly" },
    { loc: "/ferramentas", priority: "0.8", changefreq: "weekly" },
    { loc: "/ferramentas/gerador-qrcode", priority: "0.7", changefreq: "monthly" },
    { loc: "/ferramentas/gerador-link-whatsapp", priority: "0.7", changefreq: "monthly" },
    { loc: "/quem-somos", priority: "0.6", changefreq: "monthly" },
    { loc: "/contato", priority: "0.6", changefreq: "monthly" },
    { loc: "/politica-de-privacidade", priority: "0.5", changefreq: "yearly" },
    { loc: "/politica-de-cookies", priority: "0.5", changefreq: "yearly" },
    { loc: "/termos-e-condicoes", priority: "0.5", changefreq: "yearly" },
    { loc: "/lgpd", priority: "0.5", changefreq: "yearly" },
  ];

  const [posts, drivers, softwares, printers, tutorials, materials] = await Promise.all([
    fetchTable("blog_posts", "slug,updated_at", "&publicado=eq.true"),
    fetchTable("drivers", "modelo,created_at", "&ativo=eq.true"),
    fetchTable("softwares", "nome,created_at"),
    fetchTable("printers", "marca,modelo,created_at"),
    fetchTable("tutorials", "slug,created_at"),
    fetchTable("materials", "slug,created_at"),
  ]);

  for (const p of posts) entries.push({ loc: `/blog/${p.slug}`, lastmod: p.updated_at?.split("T")[0], priority: "0.7", changefreq: "weekly" });
  for (const d of drivers) entries.push({ loc: `/drivers/${slugify(d.modelo)}`, lastmod: d.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });
  for (const s of softwares) entries.push({ loc: `/softwares/${slugify(s.nome)}`, lastmod: s.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });
  for (const p of printers) entries.push({ loc: `/impressoras/${slugify(p.marca)}/${slugify(p.modelo)}`, lastmod: p.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });
  for (const t of tutorials) entries.push({ loc: `/tutoriais/${t.slug}`, lastmod: t.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });
  for (const m of materials) if (m.slug) entries.push({ loc: `/materiais/${m.slug}`, lastmod: m.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });

  return buildXml(entries);
}

export function sitemapPlugin(): Plugin {
  let outDir = "dist";
  return {
    name: "adeconex-sitemap",
    apply: "build",
    configResolved(cfg) {
      outDir = cfg.build.outDir || "dist";
    },
    async closeBundle() {
      try {
        const xml = await generate();
        const dir = resolve(process.cwd(), outDir);
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, "sitemap.xml"), xml);
        console.log(`[sitemap] wrote ${outDir}/sitemap.xml`);
      } catch (e) {
        console.warn("[sitemap] generation failed:", e);
      }
    },
  };
}
