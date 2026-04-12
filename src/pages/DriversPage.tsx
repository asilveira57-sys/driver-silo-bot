import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { DriverCard } from "@/components/cards/DriverCard";
import { ConversionBanner } from "@/components/ConversionBanner";
import { useState } from "react";
import { Search, Cpu } from "lucide-react";

export default function DriversPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const { data: drivers, isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data } = await supabase.from("drivers").select("*").eq("ativo", true).order("data_publicacao", { ascending: false });
      return data || [];
    },
  });

  const brands = [...new Set((drivers || []).map((d) => d.marca))].sort();

  const filtered = (drivers || []).filter((d) => {
    const matchSearch = !searchTerm || 
      d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.marca.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBrand = !selectedBrand || d.marca === selectedBrand;
    return matchSearch && matchBrand;
  });

  return (
    <Layout>
      <SEOHead
        title="Drivers para Impressoras Térmicas"
        description="Baixe drivers atualizados para impressoras térmicas Zebra, Elgin, Argox, Bematech e mais. Download gratuito com tutorial de instalação."
      />

      <section className="hero-gradient py-12">
        <div className="section-container">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">
            Drivers para Impressoras Térmicas
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            Downloads gratuitos e atualizados para todas as marcas.
          </p>
        </div>
      </section>

      <div className="section-container py-10">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por modelo ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBrand("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedBrand ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              Todas
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedBrand === b ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="silo-card h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d) => <DriverCard key={d.id} driver={d} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Cpu className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum driver encontrado.</p>
          </div>
        )}

        <div className="mt-16">
          <ConversionBanner />
        </div>
      </div>
    </Layout>
  );
}
