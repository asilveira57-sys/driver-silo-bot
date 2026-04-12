import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { SoftwareCard } from "@/components/cards/SoftwareCard";
import { ConversionBanner } from "@/components/ConversionBanner";
import { Package } from "lucide-react";

export default function SoftwaresPage() {
  const { data: softwares, isLoading } = useQuery({
    queryKey: ["softwares"],
    queryFn: async () => {
      const { data } = await supabase.from("softwares").select("*").order("nome");
      return data || [];
    },
  });

  return (
    <Layout>
      <SEOHead
        title="Softwares para Impressoras Térmicas"
        description="Baixe softwares como BarTender, Zebra Setup Utilities e mais. Ferramentas essenciais para impressão de etiquetas."
      />

      <section className="hero-gradient py-12">
        <div className="section-container">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">
            Softwares para Impressão
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            Ferramentas e utilitários para impressoras térmicas.
          </p>
        </div>
      </section>

      <div className="section-container py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="silo-card h-48 animate-pulse bg-muted" />)}
          </div>
        ) : softwares && softwares.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwares.map((s) => <SoftwareCard key={s.id} software={s} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum software disponível no momento.</p>
          </div>
        )}
        <div className="mt-16"><ConversionBanner /></div>
      </div>
    </Layout>
  );
}
