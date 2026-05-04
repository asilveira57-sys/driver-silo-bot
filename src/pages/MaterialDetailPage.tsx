import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { RelatedSidebar } from "@/components/RelatedSidebar";
import { Package, ChevronRight } from "lucide-react";
import { sanitizeContent } from "@/lib/htmlUtils";

export default function MaterialDetailPage() {
  const { slug } = useParams();

  const { data: material } = useQuery({
    queryKey: ["material-detail", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("materials")
        .select("*")
        .eq("slug", slug || "")
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["related-materials", material?.categoria],
    queryFn: async () => {
      const { data } = await supabase
        .from("materials")
        .select("nome, slug, categoria")
        .eq("categoria", material!.categoria)
        .neq("id", material!.id)
        .limit(6);
      return data || [];
    },
    enabled: !!material?.categoria,
  });

  const m = material as any;
  const richContent = sanitizeContent(m?.conteudo);

  return (
    <Layout>
      <SEOHead
        title={m?.meta_title || m?.nome || "Material"}
        description={m?.meta_description || m?.descricao || `Informações sobre ${m?.nome}`}
        keywords={m?.meta_keywords}
        ogImage={m?.imagem_url || undefined}
      />

      <section className="hero-gradient py-10">
        <div className="section-container">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-4">
            <Link to="/materiais" className="hover:text-primary-foreground">Materiais</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground">{m?.nome || slug}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">
            {m?.nome || slug}
          </h1>
        </div>
      </section>

      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="silo-card">
              <div className="flex flex-col md:flex-row gap-6">
                {m?.imagem_url ? (
                  <img src={m.imagem_url} alt={m.nome} className="w-48 h-48 object-contain rounded-md bg-muted" loading="lazy" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center rounded-md bg-muted">
                    <Package className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wide">{m?.categoria}</p>
                  <h2 className="text-xl font-heading font-bold text-foreground">{m?.nome}</h2>
                  {m?.descricao && <p className="text-muted-foreground mt-2">{m.descricao}</p>}
                  {m?.link_produto && (
                    <a href={m.link_produto} target="_blank" rel="noopener" className="download-btn text-sm mt-4 inline-flex">
                      Comprar Produto
                    </a>
                  )}
                </div>
              </div>
            </div>

            {richContent && (
              <div className="silo-card">
                <div
                  className="prose prose-slate max-w-none text-foreground [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_a]:text-primary"
                  dangerouslySetInnerHTML={{ __html: richContent }}
                />
              </div>
            )}

            <ConversionBanner
              title="Precisa de materiais para impressão?"
              description="Confira nossa linha completa de etiquetas, ribbons e acessórios."
              buttonText="Ver na Loja"
            />
          </div>

          <div className="space-y-6">
            {related && related.length > 0 && (
              <RelatedSidebar
                title="Materiais Relacionados"
                links={related.map((r) => ({
                  label: r.nome,
                  href: `/materiais/${r.slug}`,
                  type: "material" as const,
                }))}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
