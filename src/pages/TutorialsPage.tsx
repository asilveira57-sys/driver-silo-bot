import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { TutorialCard } from "@/components/cards/TutorialCard";
import { ConversionBanner } from "@/components/ConversionBanner";
import { useState } from "react";
import { BookOpen } from "lucide-react";

export default function TutorialsPage() {
  const [selectedCat, setSelectedCat] = useState("");

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["tutorials"],
    queryFn: async () => {
      const { data } = await supabase.from("tutorials").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const categories = [...new Set((tutorials || []).map((t) => t.categoria))].sort();
  const filtered = selectedCat ? (tutorials || []).filter((t) => t.categoria === selectedCat) : tutorials || [];

  return (
    <Layout>
      <SEOHead
        title="Tutoriais de Impressoras Térmicas"
        description="Guias completos e tutoriais passo a passo para impressoras térmicas. Instalação, configuração e resolução de problemas."
      />

      <section className="hero-gradient py-12">
        <div className="section-container">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">Tutoriais</h1>
          <p className="mt-2 text-primary-foreground/80">Guias completos para impressoras térmicas.</p>
        </div>
      </section>

      <div className="section-container py-10">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setSelectedCat("")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
              Todos
            </button>
            {categories.map((c) => (
              <button key={c} onClick={() => setSelectedCat(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
                {c}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="silo-card h-48 animate-pulse bg-muted" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((t) => <TutorialCard key={t.id} tutorial={t} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum tutorial disponível.</p>
          </div>
        )}
        <div className="mt-16"><ConversionBanner /></div>
      </div>
    </Layout>
  );
}
