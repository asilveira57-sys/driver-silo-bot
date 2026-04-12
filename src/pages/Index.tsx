import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DriverCard } from "@/components/cards/DriverCard";
import { PrinterCard } from "@/components/cards/PrinterCard";
import { TutorialCard } from "@/components/cards/TutorialCard";
import { Printer, Cpu, BookOpen, Download, Package, ArrowRight, Search } from "lucide-react";

const silos = [
  { icon: Printer, label: "Impressoras", description: "Todas as marcas e modelos", path: "/impressoras", color: "bg-primary/10 text-primary" },
  { icon: Cpu, label: "Drivers", description: "Downloads de drivers atualizados", path: "/drivers", color: "bg-secondary/30 text-secondary-foreground" },
  { icon: BookOpen, label: "Tutoriais", description: "Guias passo a passo", path: "/tutoriais", color: "bg-accent text-accent-foreground" },
  { icon: Download, label: "Softwares", description: "Ferramentas e utilitários", path: "/softwares", color: "bg-primary/10 text-primary" },
  { icon: Package, label: "Materiais", description: "Etiquetas, ribbons e mais", path: "/materiais", color: "bg-secondary/30 text-secondary-foreground" },
  { icon: Download, label: "Downloads", description: "Central completa de downloads", path: "/downloads", color: "bg-accent text-accent-foreground" },
];

export default function Index() {
  const { data: drivers } = useQuery({
    queryKey: ["latest-drivers"],
    queryFn: async () => {
      const { data } = await supabase.from("drivers").select("*").eq("ativo", true).order("data_publicacao", { ascending: false }).limit(4);
      return data || [];
    },
  });

  const { data: printers } = useQuery({
    queryKey: ["latest-printers"],
    queryFn: async () => {
      const { data } = await supabase.from("printers").select("*").order("created_at", { ascending: false }).limit(4);
      return data || [];
    },
  });

  const { data: tutorials } = useQuery({
    queryKey: ["latest-tutorials"],
    queryFn: async () => {
      const { data } = await supabase.from("tutorials").select("*").order("created_at", { ascending: false }).limit(3);
      return data || [];
    },
  });

  return (
    <Layout>
      <SEOHead
        title="Hub Técnico de Impressoras Térmicas"
        description="Central técnica Adeconex: drivers, softwares, tutoriais e materiais para impressoras térmicas. Downloads gratuitos e guias completos."
        canonical="https://www.adeconex.com"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Adeconex - Hub Técnico",
          url: "https://www.adeconex.com",
          description: "Central técnica de impressoras térmicas, etiquetas e ribbons",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.adeconex.com/downloads?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Hero */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-primary-foreground leading-tight">
            Hub Técnico de<br />
            <span className="text-secondary">Impressoras Térmicas</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Drivers, softwares, tutoriais e materiais para impressoras térmicas.
            Tudo em um só lugar, gratuito e atualizado.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/drivers" className="download-btn text-base">
              <Download className="h-5 w-5" />
              Buscar Drivers
            </Link>
            <Link
              to="/downloads"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-heading font-bold text-primary-foreground border-2 border-primary-foreground/30 hover:bg-primary-foreground/10 transition-colors"
            >
              <Search className="h-5 w-5" />
              Central de Downloads
            </Link>
          </div>
        </div>
      </section>

      {/* Silos Grid */}
      <section className="section-container py-16">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center text-foreground mb-10">
          Explore por Categoria
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {silos.map((silo) => (
            <Link
              key={silo.path}
              to={silo.path}
              className="silo-card group flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${silo.color}`}>
                <silo.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                  {silo.label}
                </h3>
                <p className="text-sm text-muted-foreground">{silo.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Drivers */}
      {drivers && drivers.length > 0 && (
        <section className="bg-muted py-16">
          <div className="section-container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-heading font-bold text-foreground">Drivers Recentes</h2>
              <Link to="/drivers" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {drivers.map((d) => <DriverCard key={d.id} driver={d} />)}
            </div>
          </div>
        </section>
      )}

      {/* Latest Printers */}
      {printers && printers.length > 0 && (
        <section className="section-container py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-heading font-bold text-foreground">Impressoras</h2>
            <Link to="/impressoras" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {printers.map((p) => <PrinterCard key={p.id} printer={p} />)}
          </div>
        </section>
      )}

      {/* Latest Tutorials */}
      {tutorials && tutorials.length > 0 && (
        <section className="bg-muted py-16">
          <div className="section-container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-heading font-bold text-foreground">Tutoriais</h2>
              <Link to="/tutoriais" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tutorials.map((t) => <TutorialCard key={t.id} tutorial={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* Conversion Banner */}
      <section className="section-container py-16">
        <ConversionBanner />
      </section>
    </Layout>
  );
}
