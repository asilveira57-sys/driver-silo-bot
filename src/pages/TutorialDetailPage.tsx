import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { RelatedSidebar } from "@/components/RelatedSidebar";
import { ChevronRight, BookOpen, Calendar } from "lucide-react";
import { sanitizeContent } from "@/lib/htmlUtils";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleWithMidAd } from "@/components/ads/ArticleWithMidAd";
import { MultiplexAd } from "@/components/ads/MultiplexAd";
import { StickySidebarAd } from "@/components/ads/StickySidebarAd";

export default function TutorialDetailPage() {
  const { slug } = useParams();

  const { data: tutorial } = useQuery({
    queryKey: ["tutorial-detail", slug],
    queryFn: async () => {
      const { data } = await supabase.from("tutorials").select("*").eq("slug", slug || "").maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["related-tutorials", tutorial?.categoria],
    queryFn: async () => {
      const { data } = await supabase.from("tutorials").select("titulo, slug").eq("categoria", tutorial!.categoria).neq("slug", slug || "").limit(6);
      return data || [];
    },
    enabled: !!tutorial?.categoria,
  });

  const t = tutorial as any;
  const sanitized = sanitizeContent(tutorial?.conteudo);
  const isHtml = sanitized.includes("<");

  return (
    <Layout>
      <SEOHead
        title={t?.meta_title || tutorial?.titulo || "Tutorial"}
        description={t?.meta_description || (tutorial ? tutorial.conteudo.replace(/<[^>]*>/g, "").substring(0, 155) : "Tutorial técnico para impressoras térmicas.")}
        keywords={t?.meta_keywords}
        ogImage={tutorial?.imagem_url || undefined}
        jsonLd={tutorial ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: tutorial.titulo,
          datePublished: tutorial.created_at,
          image: tutorial.imagem_url,
          author: { "@type": "Organization", name: "Adeconex" },
        } : undefined}
      />

      <section className="hero-gradient py-10">
        <div className="section-container">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-4">
            <Link to="/tutoriais" className="hover:text-primary-foreground">Tutoriais</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground">{tutorial?.categoria}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">
            {tutorial?.titulo || "Carregando..."}
          </h1>
          {tutorial && (
            <div className="flex items-center gap-3 mt-3 text-sm text-primary-foreground/60">
              <Calendar className="h-4 w-4" />
              {new Date(tutorial.created_at).toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>
      </section>

      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {tutorial ? (
              <article className="silo-card">
                <AdSlot position="top" pageType="tutorial" minHeight={100} />
                {isHtml ? (
                  <ArticleWithMidAd html={sanitized} pageType="tutorial" />
                ) : (
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">{tutorial.conteudo}</div>
                )}
                <AdSlot position="bottom" pageType="tutorial" minHeight={250} />
              </article>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Tutorial não encontrado.</p>
              </div>
            )}
            {tutorial && <MultiplexAd pageType="tutorial" />}
            <div className="mt-8"><ConversionBanner /></div>
          </div>
          <div className="space-y-6">
            <StickySidebarAd pageType="tutorial" />
            {related && related.length > 0 && (
              <RelatedSidebar title="Tutoriais Relacionados" links={related.map((r) => ({ label: r.titulo, href: `/tutoriais/${r.slug}`, type: "tutorial" as const }))} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
