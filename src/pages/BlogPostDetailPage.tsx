import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { RelatedSidebar } from "@/components/RelatedSidebar";
import { ChevronRight, Calendar, BookOpen } from "lucide-react";
import { sanitizeContent } from "@/lib/htmlUtils";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleWithMidAd } from "@/components/ads/ArticleWithMidAd";
import { MultiplexAd } from "@/components/ads/MultiplexAd";
import { StickySidebarAd } from "@/components/ads/StickySidebarAd";

export default function BlogPostDetailPage() {
  const { slug } = useParams();

  const { data: post } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug || "").eq("publicado", true).maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  const { data: related } = useQuery({
    queryKey: ["related-blog", post?.categoria],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("titulo, slug").eq("categoria", post!.categoria).eq("publicado", true).neq("slug", slug || "").limit(6);
      return data || [];
    },
    enabled: !!post?.categoria,
  });

  const sanitizedContent = sanitizeContent(post?.conteudo);

  return (
    <Layout>
      <SEOHead
        title={(post as any)?.meta_title || post?.titulo || "Blog"}
        description={(post as any)?.meta_description || post?.resumo || "Artigo do blog Adeconex sobre impressoras térmicas."}
        keywords={(post as any)?.meta_keywords}
        ogImage={post?.imagem_url || undefined}
        jsonLd={post ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.titulo,
          description: post.resumo,
          datePublished: post.created_at,
          dateModified: post.updated_at,
          image: post.imagem_url,
          author: { "@type": "Organization", name: "Adeconex" },
          publisher: { "@type": "Organization", name: "Adeconex" },
        } : undefined}
      />

      <section className="hero-gradient py-10">
        <div className="section-container">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-4">
            <Link to="/blog" className="hover:text-primary-foreground">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground">{post?.categoria}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">
            {post?.titulo || "Carregando..."}
          </h1>
          {post && (
            <div className="flex items-center gap-3 mt-3 text-sm text-primary-foreground/60">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString("pt-BR")}
            </div>
          )}
        </div>
      </section>

      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {post ? (
              <article className="silo-card">
                {post.imagem_url && (
                  <img src={post.imagem_url} alt={post.titulo} className="w-full h-auto rounded-lg mb-6" loading="lazy" />
                )}
                <AdSlot position="top" pageType="blog" minHeight={100} />
                <ArticleWithMidAd html={sanitizedContent} pageType="blog" />
                <AdSlot position="bottom" pageType="blog" minHeight={250} />
              </article>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Post não encontrado.</p>
              </div>
            )}
            {post && <MultiplexAd pageType="blog" />}
            <div className="mt-8"><ConversionBanner /></div>
          </div>
          <div className="space-y-6">
            <StickySidebarAd pageType="blog" />
            {related && related.length > 0 && (
              <RelatedSidebar
                title="Posts Relacionados"
                links={related.map((r) => ({
                  label: r.titulo,
                  href: `/blog/${r.slug}`,
                  type: "tutorial" as const,
                }))}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
