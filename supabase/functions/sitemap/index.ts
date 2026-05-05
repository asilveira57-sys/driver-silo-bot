import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
};

const SITE_URL = "https://www.adeconex.com";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const [blogRes, driversRes, softwaresRes, printersRes, tutorialsRes, materialsRes] = await Promise.all([
    supabase.from("blog_posts").select("slug, updated_at").eq("publicado", true),
    supabase.from("drivers").select("modelo, created_at").eq("ativo", true),
    supabase.from("softwares").select("nome, created_at"),
    supabase.from("printers").select("marca, modelo, created_at"),
    supabase.from("tutorials").select("slug, created_at"),
    supabase.from("materials").select("slug, created_at"),
  ]);

  const urls: { loc: string; lastmod?: string; priority: string; changefreq: string }[] = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/blog", priority: "0.9", changefreq: "daily" },
    { loc: "/impressoras", priority: "0.8", changefreq: "weekly" },
    { loc: "/drivers", priority: "0.8", changefreq: "weekly" },
    { loc: "/softwares", priority: "0.8", changefreq: "weekly" },
    { loc: "/tutoriais", priority: "0.8", changefreq: "weekly" },
    { loc: "/materiais", priority: "0.8", changefreq: "weekly" },
    { loc: "/downloads", priority: "0.7", changefreq: "weekly" },
  ];

  for (const post of blogRes.data || []) {
    urls.push({ loc: `/blog/${post.slug}`, lastmod: post.updated_at?.split("T")[0], priority: "0.7", changefreq: "weekly" });
  }
  for (const d of driversRes.data || []) {
    const slug = d.modelo.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    urls.push({ loc: `/drivers/${slug}`, lastmod: d.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });
  }
  for (const s of softwaresRes.data || []) {
    const slug = s.nome.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    urls.push({ loc: `/softwares/${slug}`, lastmod: s.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });
  }
  for (const p of printersRes.data || []) {
    const marca = p.marca.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const modelo = p.modelo.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    urls.push({ loc: `/impressoras/${marca}/${modelo}`, lastmod: p.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });
  }
  for (const t of tutorialsRes.data || []) {
    urls.push({ loc: `/tutoriais/${t.slug}`, lastmod: t.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });
  }
  for (const m of materialsRes.data || []) {
    if (m.slug) urls.push({ loc: `/materiais/${m.slug}`, lastmod: m.created_at?.split("T")[0], priority: "0.6", changefreq: "monthly" });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, { headers: corsHeaders });
});
