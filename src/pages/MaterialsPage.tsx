import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { MaterialCard } from "@/components/cards/MaterialCard";
import { ConversionBanner } from "@/components/ConversionBanner";
import { useState } from "react";
import { Package } from "lucide-react";

export default function MaterialsPage() {
  const [selectedCat, setSelectedCat] = useState("");

  const { data: materials, isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const { data } = await supabase.from("materials").select("*").order("categoria").order("nome");
      return data || [];
    },
  });

  const categories = [...new Set((materials || []).map((m) => m.categoria))].sort();
  const filtered = selectedCat ? (materials || []).filter((m) => m.categoria === selectedCat) : materials || [];

  return (
    <Layout>
      <SEOHead
        title="Materiais para Impressão Térmica"
        description="Etiquetas adesivas, ribbons, fita de cetim e mais materiais para impressoras térmicas. Guia completo de produtos."
      />

      <section className="hero-gradient py-12">
        <div className="section-container">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">Materiais</h1>
          <p className="mt-2 text-primary-foreground/80">Etiquetas, ribbons e acessórios para impressão térmica.</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="silo-card h-48 animate-pulse bg-muted" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => <MaterialCard key={m.id} material={m} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum material disponível.</p>
          </div>
        )}
        <div className="mt-16"><ConversionBanner /></div>
      </div>
    </Layout>
  );
}
