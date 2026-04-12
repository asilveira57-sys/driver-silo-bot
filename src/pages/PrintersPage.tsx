import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { PrinterCard } from "@/components/cards/PrinterCard";
import { ConversionBanner } from "@/components/ConversionBanner";
import { Printer } from "lucide-react";

export default function PrintersPage() {
  const { marca } = useParams();

  const { data: printers, isLoading } = useQuery({
    queryKey: ["printers", marca],
    queryFn: async () => {
      let query = supabase.from("printers").select("*").order("marca").order("modelo");
      if (marca) query = query.ilike("marca", marca);
      const { data } = await query;
      return data || [];
    },
  });

  const { data: brands } = useQuery({
    queryKey: ["printer-brands"],
    queryFn: async () => {
      const { data } = await supabase.from("printers").select("marca");
      const unique = [...new Set((data || []).map((d) => d.marca))].sort();
      return unique;
    },
  });

  const title = marca
    ? `Impressoras ${marca.charAt(0).toUpperCase() + marca.slice(1)}`
    : "Impressoras Térmicas";

  return (
    <Layout>
      <SEOHead
        title={title}
        description={`Catálogo completo de ${title.toLowerCase()}. Encontre modelos, drivers e tutoriais.`}
      />

      <section className="hero-gradient py-12">
        <div className="section-container">
          <h1 className="text-3xl md:text-4xl font-heading font-black text-primary-foreground">
            {title}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            Catálogo completo com drivers e tutoriais para cada modelo.
          </p>
        </div>
      </section>

      <div className="section-container py-10">
        {/* Brand filters */}
        {brands && brands.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              to="/impressoras"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !marca ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
              }`}
            >
              Todas
            </Link>
            {brands.map((b) => (
              <Link
                key={b}
                to={`/impressoras/${b.toLowerCase()}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  marca === b.toLowerCase() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                }`}
              >
                {b}
              </Link>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="silo-card h-64 animate-pulse bg-muted" />
            ))}
          </div>
        ) : printers && printers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {printers.map((p) => <PrinterCard key={p.id} printer={p} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <Printer className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma impressora encontrada.</p>
            <p className="text-sm text-muted-foreground mt-1">Em breve adicionaremos novos modelos.</p>
          </div>
        )}

        <div className="mt-16">
          <ConversionBanner
            title="Procurando uma impressora para comprar?"
            description="Confira nossas impressoras térmicas com garantia e suporte técnico."
            buttonText="Ver Impressoras na Loja"
          />
        </div>
      </div>
    </Layout>
  );
}
