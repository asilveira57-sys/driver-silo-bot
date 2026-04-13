import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { BookOpen, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("publicado", true).order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <Layout>
      <SEOHead
        title="Blog Adeconex - Notícias e Dicas"
        description="Blog técnico sobre impressoras térmicas, etiquetas e ribbons. Novidades, dicas e tutoriais do mercado de impressão."
        keywords="blog impressora térmica, dicas etiquetas, ribbon, impressão térmica"
      />

      <section className="hero-gradient py-12">
        <div className="section-container">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">Blog</h1>
          <p className="mt-2 text-primary-foreground/80">Notícias e dicas do mundo da impressão térmica.</p>
        </div>
      </section>

      <div className="section-container py-10">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {posts.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="silo-card group hover:shadow-lg transition-shadow">
                {p.imagem_url && (
                  <img src={p.imagem_url} alt={p.titulo} className="w-full h-48 object-cover rounded-lg mb-4" loading="lazy" />
                )}
                <span className="text-xs font-medium text-primary uppercase tracking-wide">{p.categoria}</span>
                <h2 className="font-heading font-bold text-foreground text-lg mt-1 group-hover:text-primary transition-colors">{p.titulo}</h2>
                {p.resumo && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.resumo}</p>}
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(p.created_at).toLocaleDateString("pt-BR")}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground font-heading font-bold">Em breve</p>
            <p className="text-muted-foreground mt-1">Novos artigos serão publicados aqui.</p>
            <Link to="/tutoriais" className="text-primary hover:underline text-sm mt-4 inline-block">
              Enquanto isso, confira nossos tutoriais →
            </Link>
          </div>
        )}
        <ConversionBanner />
      </div>
    </Layout>
  );
}
