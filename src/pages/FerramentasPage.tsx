import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { AdSlot } from "@/components/ads/AdSlot";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import { ArrowRight, Wrench } from "lucide-react";

type Tool = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  categoria: string;
  icone: string | null;
  ativo: boolean;
};

function ToolIcon({ name }: { name: string | null }) {
  const Cmp = (name && (Icons as any)[name]) || Wrench;
  return <Cmp className="h-8 w-8 text-primary" />;
}

export default function FerramentasPage() {
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["tools-list"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("tools")
        .select("*")
        .eq("ativo", true)
        .order("ordem", { ascending: true });
      return (data || []) as Tool[];
    },
  });

  const canonical = "https://www.adeconex.com/ferramentas";

  return (
    <Layout>
      <SEOHead
        title="Ferramentas Gratuitas Online para Ecommerce e Impressão"
        description="Utilize ferramentas gratuitas online para criar QR Codes, gerar etiquetas, calcular margens, converter arquivos e muito mais."
        keywords="ferramentas online, ferramentas gratuitas, qr code, gerador qr code, ferramentas ecommerce, ferramentas mercado livre, ferramentas para impressão, utilitários online"
        canonical={canonical}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Ferramentas Gratuitas Adeconex",
          url: canonical,
        }}
      />

      <section className="hero-gradient text-primary-foreground py-14">
        <div className="section-container text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            Ferramentas Gratuitas para Ecommerce, Impressão e Produtividade
          </h1>
          <p className="text-base md:text-lg max-w-3xl mx-auto opacity-95">
            Biblioteca de ferramentas online gratuitas para gerar QR Codes, converter arquivos, criar etiquetas,
            calcular margens e facilitar o dia a dia de empresas e profissionais.
          </p>
        </div>
      </section>

      <div className="section-container py-10">
        <AdSlot position="top" pageType="ferramentas" />

        {isLoading ? (
          <p className="text-muted-foreground">Carregando ferramentas...</p>
        ) : tools.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma ferramenta disponível no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t) => (
              <Card key={t.id} className="silo-card flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <ToolIcon name={t.icone} />
                    <Badge variant="secondary" className="capitalize">{t.categoria}</Badge>
                  </div>
                  <CardTitle className="font-heading text-xl mt-3">{t.nome}</CardTitle>
                  <CardDescription>{t.descricao}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <Link to={`/ferramentas/${t.slug}`} className="w-full">
                    <Button className="w-full cta-gradient border-0 text-secondary-foreground font-heading font-bold">
                      Utilizar <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <AdSlot position="bottom" pageType="ferramentas" />
      </div>
    </Layout>
  );
}
