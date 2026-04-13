import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { RelatedSidebar } from "@/components/RelatedSidebar";
import { Printer, Download, BookOpen, ChevronRight } from "lucide-react";
import DOMPurify from "dompurify";

export default function PrinterDetailPage() {
  const { marca, modelo } = useParams();

  const { data: printer } = useQuery({
    queryKey: ["printer-detail", marca, modelo],
    queryFn: async () => {
      const { data } = await supabase.from("printers").select("*").ilike("marca", marca || "").ilike("modelo", modelo?.replace(/-/g, " ") || "").limit(1).maybeSingle();
      return data;
    },
    enabled: !!marca && !!modelo,
  });

  const { data: drivers } = useQuery({
    queryKey: ["printer-drivers", modelo],
    queryFn: async () => {
      const { data } = await supabase.from("drivers").select("*").ilike("modelo", modelo?.replace(/-/g, " ") || "").eq("ativo", true);
      return data || [];
    },
    enabled: !!modelo,
  });

  const { data: relatedPrinters } = useQuery({
    queryKey: ["related-printers", marca],
    queryFn: async () => {
      const { data } = await supabase.from("printers").select("marca, modelo").ilike("marca", marca || "").limit(6);
      return data || [];
    },
    enabled: !!marca,
  });

  const p = printer as any;
  const displayName = printer ? `${printer.marca} ${printer.modelo}` : `${marca} ${modelo?.replace(/-/g, " ")}`;
  const richContent = p?.conteudo ? DOMPurify.sanitize(p.conteudo) : "";

  return (
    <Layout>
      <SEOHead
        title={p?.meta_title || `${displayName} - Drivers e Tutoriais`}
        description={p?.meta_description || `Tudo sobre a impressora ${displayName}: drivers, softwares, tutoriais e informações técnicas.`}
        keywords={p?.meta_keywords}
        ogImage={printer?.imagem_url || undefined}
      />

      <section className="hero-gradient py-10">
        <div className="section-container">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-4">
            <Link to="/impressoras" className="hover:text-primary-foreground">Impressoras</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/impressoras/${marca}`} className="hover:text-primary-foreground capitalize">{marca}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground capitalize">{modelo?.replace(/-/g, " ")}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">{displayName}</h1>
        </div>
      </section>

      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="silo-card">
              <div className="flex flex-col md:flex-row gap-6">
                {printer?.imagem_url ? (
                  <img src={printer.imagem_url} alt={displayName} className="w-48 h-48 object-contain rounded-md bg-muted" loading="lazy" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center rounded-md bg-muted"><Printer className="h-16 w-16 text-muted-foreground/30" /></div>
                )}
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground">{displayName}</h2>
                  <p className="text-muted-foreground mt-2">{printer?.descricao || "Informações detalhadas em breve."}</p>
                </div>
              </div>
            </div>

            {richContent && (
              <div className="silo-card">
                <div className="prose prose-slate max-w-none text-foreground [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: richContent }} />
              </div>
            )}

            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2"><Download className="h-5 w-5 text-primary" />Drivers Disponíveis</h2>
              {drivers && drivers.length > 0 ? (
                <div className="space-y-3">
                  {drivers.map((d) => (
                    <div key={d.id} className="silo-card flex items-center gap-4">
                      <div className="flex-1"><p className="font-heading font-bold text-foreground">{d.nome}</p><p className="text-sm text-muted-foreground">v{d.versao} • {d.sistema_operacional}</p></div>
                      <a href={d.link_download} target="_blank" rel="noopener" className="download-btn text-sm"><Download className="h-4 w-4" />Download</a>
                    </div>
                  ))}
                </div>
              ) : (<p className="text-muted-foreground">Nenhum driver disponível no momento.</p>)}
            </div>

            <ConversionBanner title={`Comprando a ${displayName}?`} description="Encontre esta impressora e acessórios na nossa loja online." buttonText="Ver na Loja" />
          </div>

          <div className="space-y-6">
            {relatedPrinters && relatedPrinters.length > 0 && (
              <RelatedSidebar title={`Mais ${marca}`} links={relatedPrinters.map((rp) => ({ label: `${rp.marca} ${rp.modelo}`, href: `/impressoras/${rp.marca.toLowerCase()}/${rp.modelo.toLowerCase().replace(/\s+/g, "-")}`, type: "printer" as const }))} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
