import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { Download, ChevronRight, Package } from "lucide-react";
import { sanitizeContent } from "@/lib/htmlUtils";

export default function SoftwareDetailPage() {
  const { nome } = useParams();
  const nomeNorm = nome?.replace(/-/g, " ") || "";

  const { data: software } = useQuery({
    queryKey: ["software-detail", nome],
    queryFn: async () => {
      const { data } = await supabase.from("softwares").select("*").ilike("nome", nomeNorm).maybeSingle();
      return data;
    },
    enabled: !!nome,
  });

  const s = software as any;
  const richContent = sanitizeContent(s?.conteudo);

  return (
    <Layout>
      <SEOHead
        title={s?.meta_title || `${software?.nome || nomeNorm} - Download Gratuito`}
        description={s?.meta_description || `Baixe ${software?.nome || nomeNorm} gratuitamente. ${software?.descricao || "Software para impressoras térmicas."}`}
        keywords={s?.meta_keywords}
      />

      <section className="hero-gradient py-10">
        <div className="section-container">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-4">
            <Link to="/softwares" className="hover:text-primary-foreground">Softwares</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground capitalize">{nomeNorm}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">{software?.nome || nomeNorm}</h1>
        </div>
      </section>

      <div className="section-container py-10 max-w-3xl">
        {software ? (
          <div className="space-y-8">
            <div className="silo-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-md bg-secondary/20"><Package className="h-6 w-6 text-secondary-foreground" /></div>
                <div><h2 className="font-heading font-bold text-foreground">{software.nome}</h2><span className="text-sm text-muted-foreground">Versão {software.versao}</span></div>
              </div>
              {software.descricao && <p className="text-muted-foreground">{software.descricao}</p>}
              <a href={software.link_download} target="_blank" rel="noopener" className="download-btn text-base mt-6 inline-flex"><Download className="h-5 w-5" />Download {software.nome}</a>
            </div>
            {richContent && (
              <div className="silo-card">
                <div className="prose prose-slate max-w-none text-foreground [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: richContent }} />
              </div>
            )}
            <ConversionBanner />
          </div>
        ) : (
          <div className="text-center py-20"><Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">Software não encontrado.</p></div>
        )}
      </div>
    </Layout>
  );
}
