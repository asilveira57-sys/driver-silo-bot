import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { RelatedSidebar } from "@/components/RelatedSidebar";
import { Download, Monitor, Calendar, ChevronRight, AlertTriangle } from "lucide-react";
import { sanitizeContent } from "@/lib/htmlUtils";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleWithMidAd } from "@/components/ads/ArticleWithMidAd";
import { MultiplexAd } from "@/components/ads/MultiplexAd";
import { StickySidebarAd } from "@/components/ads/StickySidebarAd";

export default function DriverDetailPage() {
  const { modelo } = useParams();
  const modeloNorm = modelo?.replace(/-/g, " ") || "";

  const { data: drivers } = useQuery({
    queryKey: ["driver-detail", modelo],
    queryFn: async () => {
      const { data } = await supabase.from("drivers").select("*").ilike("modelo", modeloNorm).eq("ativo", true).order("versao", { ascending: false });
      return data || [];
    },
    enabled: !!modelo,
  });

  const { data: relatedDrivers } = useQuery({
    queryKey: ["related-drivers", modelo],
    queryFn: async () => {
      const { data } = await supabase.from("drivers").select("modelo, marca").eq("ativo", true).limit(10);
      const unique = [...new Map((data || []).map((d) => [d.modelo, d])).values()];
      return unique.filter((d) => d.modelo.toLowerCase().replace(/\s+/g, "-") !== modelo);
    },
    enabled: !!modelo,
  });

  const mainDriver = drivers?.[0] as any;
  const displayName = mainDriver ? `${mainDriver.marca} ${mainDriver.modelo}` : modeloNorm;
  const richContent = sanitizeContent(mainDriver?.conteudo);

  const handleDownload = async (driverId: string) => {
    await supabase.from("download_logs").insert({ driver_id: driverId });
  };

  return (
    <Layout>
      <SEOHead
        title={mainDriver?.meta_title || `Driver ${displayName} - Download Gratuito`}
        description={mainDriver?.meta_description || `Baixe o driver mais recente para ${displayName}. Compatível com Windows. Tutorial de instalação e solução de problemas.`}
        keywords={mainDriver?.meta_keywords}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: `Driver ${displayName}`,
          operatingSystem: mainDriver?.sistema_operacional || "Windows",
          applicationCategory: "DriverApplication",
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        }}
      />

      <section className="hero-gradient py-10">
        <div className="section-container">
          <nav className="flex items-center gap-2 text-sm text-primary-foreground/60 mb-4">
            <Link to="/drivers" className="hover:text-primary-foreground">Drivers</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-foreground capitalize">{modeloNorm}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">Driver {displayName}</h1>
          <p className="mt-2 text-primary-foreground/80">Download gratuito com tutorial de instalação</p>
        </div>
      </section>

      <div className="section-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {mainDriver && (
              <div className="silo-card">
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">Download Rápido</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="font-heading font-bold text-foreground">{mainDriver.nome}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Monitor className="h-3 w-3" />{mainDriver.sistema_operacional}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(mainDriver.data_publicacao).toLocaleDateString("pt-BR")}</span>
                      <span>v{mainDriver.versao}</span>
                    </div>
                  </div>
                  <a href={mainDriver.link_download} target="_blank" rel="noopener" onClick={() => handleDownload(mainDriver.id)} className="download-btn text-base"><Download className="h-5 w-5" />Download Driver</a>
                </div>
              </div>
            )}

            <AdSlot position="top" pageType="driver" minHeight={100} />

            {richContent && (
              <div className="silo-card">
                <ArticleWithMidAd html={richContent} pageType="driver" />
              </div>
            )}

            {drivers && drivers.length > 1 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-foreground mb-4">Todas as Versões</h2>
                <div className="space-y-3">
                  {drivers.map((d) => (
                    <div key={d.id} className="silo-card flex items-center gap-4">
                      <div className="flex-1"><p className="font-medium text-foreground">{d.nome} <span className="text-muted-foreground text-sm">v{d.versao}</span></p><p className="text-sm text-muted-foreground">{d.sistema_operacional}</p></div>
                      <a href={d.link_download} target="_blank" rel="noopener" onClick={() => handleDownload(d.id)} className="text-sm font-medium text-primary hover:underline flex items-center gap-1"><Download className="h-4 w-4" /> Baixar</a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!richContent && (
              <>
                <div className="silo-card">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4">Como Instalar o Driver</h2>
                  <ol className="space-y-4">
                    {["Faça o download do driver clicando no botão acima","Execute o arquivo baixado como administrador","Siga as instruções do assistente de instalação","Conecte a impressora via USB ou configure a rede","Reinicie o computador se solicitado","Imprima uma página de teste para confirmar"].map((step, i) => (
                      <li key={i} className="flex items-start gap-3"><span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">{i + 1}</span><p className="text-foreground">{step}</p></li>
                    ))}
                  </ol>
                </div>
                <div className="silo-card">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-secondary" />Problemas Comuns</h2>
                  <div className="space-y-4">
                    {[{q:"Impressora não reconhecida",a:"Verifique o cabo USB. Tente outra porta."},{q:"Erro ao instalar",a:"Execute como administrador. Desative o antivírus."},{q:"Impressão sai em branco",a:"Verifique ribbon e etiqueta."},{q:"Driver incompatível",a:"Baixe a versão correta para seu SO."}].map((item)=>(
                      <div key={item.q}><h3 className="font-heading font-bold text-foreground text-sm">{item.q}</h3><p className="text-sm text-muted-foreground mt-1">{item.a}</p></div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <AdSlot position="bottom" pageType="driver" minHeight={250} />
            <ConversionBanner title="Produtos recomendados para esta impressora" description="Etiquetas, ribbons e acessórios compatíveis na loja Adeconex." buttonText="Ver Produtos Compatíveis" />
            <MultiplexAd pageType="driver" />
          </div>

          <div className="space-y-6">
            <StickySidebarAd pageType="driver" />
            {relatedDrivers && relatedDrivers.length > 0 && (
              <RelatedSidebar title="Outros Modelos" links={relatedDrivers.map((d) => ({ label: `${d.marca} ${d.modelo}`, href: `/drivers/${d.modelo.toLowerCase().replace(/\s+/g, "-")}`, type: "driver" as const }))} />
            )}
            <div className="silo-card">
              <h3 className="font-heading font-bold text-foreground mb-3">Links Úteis</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/tutoriais" className="text-primary hover:underline">Tutoriais de Impressoras</Link></li>
                <li><Link to="/softwares" className="text-primary hover:underline">Softwares Complementares</Link></li>
                <li><Link to="/materiais" className="text-primary hover:underline">Etiquetas e Ribbons</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
