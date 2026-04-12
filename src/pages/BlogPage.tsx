import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogPage() {
  return (
    <Layout>
      <SEOHead
        title="Blog Adeconex - Notícias e Dicas"
        description="Blog técnico sobre impressoras térmicas, etiquetas e ribbons. Novidades, dicas e tutoriais do mercado de impressão."
      />

      <section className="hero-gradient py-12">
        <div className="section-container">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">Blog</h1>
          <p className="mt-2 text-primary-foreground/80">Notícias e dicas do mundo da impressão térmica.</p>
        </div>
      </section>

      <div className="section-container py-10">
        <div className="text-center py-20">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground font-heading font-bold">Em breve</p>
          <p className="text-muted-foreground mt-1">Novos artigos serão publicados aqui.</p>
          <Link to="/tutoriais" className="text-primary hover:underline text-sm mt-4 inline-block">
            Enquanto isso, confira nossos tutoriais →
          </Link>
        </div>
        <ConversionBanner />
      </div>
    </Layout>
  );
}
