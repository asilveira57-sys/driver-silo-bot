import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { useState } from "react";
import { Search, Download, Monitor, Calendar, Filter } from "lucide-react";

export default function DownloadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "driver" | "software">("all");

  const { data: drivers } = useQuery({
    queryKey: ["all-drivers"],
    queryFn: async () => {
      const { data } = await supabase.from("drivers").select("*").eq("ativo", true).order("data_publicacao", { ascending: false });
      return data || [];
    },
  });

  const { data: softwares } = useQuery({
    queryKey: ["all-softwares"],
    queryFn: async () => {
      const { data } = await supabase.from("softwares").select("*").order("nome");
      return data || [];
    },
  });

  const brands = [...new Set((drivers || []).map((d) => d.marca))].sort();

  const items: Array<{ type: "driver" | "software"; name: string; brand: string; model: string; version: string; os: string; link: string; date: string; id: string }> = [
    ...(drivers || []).map((d) => ({
      type: "driver" as const, name: d.nome, brand: d.marca, model: d.modelo,
      version: d.versao, os: d.sistema_operacional, link: d.link_download,
      date: d.data_publicacao, id: d.id,
    })),
    ...(softwares || []).map((s) => ({
      type: "software" as const, name: s.nome, brand: "", model: "",
      version: s.versao, os: "", link: s.link_download,
      date: s.created_at, id: s.id,
    })),
  ];

  const filtered = items.filter((item) => {
    const matchSearch = !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBrand = !selectedBrand || item.brand === selectedBrand;
    const matchType = selectedType === "all" || item.type === selectedType;
    return matchSearch && matchBrand && matchType;
  });

  const handleDownload = async (item: typeof items[0]) => {
    if (item.type === "driver") {
      await supabase.from("download_logs").insert({ driver_id: item.id });
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Central de Downloads - Drivers e Softwares"
        description="Central completa de downloads: drivers e softwares para impressoras térmicas. Filtros por marca, modelo e tipo."
      />

      <section className="hero-gradient py-12">
        <div className="section-container">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">Central de Downloads</h1>
          <p className="mt-2 text-primary-foreground/80">Todos os drivers e softwares em um só lugar.</p>
        </div>
      </section>

      <div className="section-container py-10">
        {/* Filters */}
        <div className="silo-card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="font-heading font-bold text-foreground">Filtros</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome, modelo ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            >
              <option value="">Todas as marcas</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="flex gap-2">
              {[
                { value: "all", label: "Todos" },
                { value: "driver", label: "Drivers" },
                { value: "software", label: "Softwares" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedType(opt.value as typeof selectedType)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedType === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <p className="text-sm text-muted-foreground mb-4">{filtered.length} resultado(s)</p>

        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={`${item.type}-${item.id}`} className="silo-card flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.type === "driver" ? "bg-primary/10 text-primary" : "bg-secondary/30 text-secondary-foreground"}`}>
                  {item.type === "driver" ? "Driver" : "Software"}
                </span>
                <div className="flex-1">
                  <p className="font-heading font-bold text-foreground">{item.name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    {item.brand && <span>{item.brand} — {item.model}</span>}
                    <span>v{item.version}</span>
                    {item.os && <span className="flex items-center gap-1"><Monitor className="h-3 w-3" />{item.os}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(item.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener"
                  onClick={() => handleDownload(item)}
                  className="download-btn text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Download className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
          </div>
        )}

        <div className="mt-16"><ConversionBanner /></div>
      </div>
    </Layout>
  );
}
