import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Mail, Phone, MapPin, Globe, MessageCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ContatoPage() {
  return (
    <Layout>
      <SEOHead
        title="Contato"
        description="Fale com a Adeconex: canais oficiais de atendimento, suporte ao portal Adeconex Drivers, e-mail comercial e WhatsApp."
        canonical="https://www.adeconex.com/contato"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contato - Adeconex",
          url: "https://www.adeconex.com/contato",
          mainEntity: {
            "@type": "Organization",
            name: "Adeconex",
            email: "vendas@adeconex.com.br",
            telephone: "+55-27-3318-6565",
            url: "https://www.adeconex.com.br",
          },
        }}
      />

      <section className="relative bg-gradient-to-b from-accent/40 via-background to-background border-b border-border">
        <div className="section-container py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground mb-5">
            <Link to="/" className="hover:text-primary transition-colors">Início</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground/80">Contato</span>
          </nav>
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            Atendimento Oficial Adeconex
          </p>
          <h1 className="font-heading font-black text-3xl md:text-5xl text-foreground leading-tight max-w-3xl">
            Fale com a Adeconex
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
            Tire dúvidas, envie sugestões ou solicite suporte relacionado ao portal Adeconex Drivers
            pelos nossos canais oficiais de atendimento.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="mailto:vendas@adeconex.com.br"
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">E-mail comercial</p>
                <p className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                  vendas@adeconex.com.br
                </p>
              </div>
            </a>

            <a
              href="https://wa.me/5527331865 65"
              target="_blank"
              rel="noopener"
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</p>
                <p className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                  (27) 3318-6565
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Telefone</p>
                <p className="font-heading font-semibold text-foreground">(27) 3318-6565</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Localização</p>
                <p className="font-heading font-semibold text-foreground">Vila Velha — ES, Brasil</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-heading font-bold text-xl text-foreground mb-2">
              Sites oficiais
            </h2>
            <p className="text-muted-foreground mb-4">
              Conheça também nosso site institucional e nossa loja oficial.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <a className="text-primary font-medium hover:underline" href="https://www.adeconex.com.br" target="_blank" rel="noopener">
                  www.adeconex.com.br
                </a>
                <span className="text-muted-foreground text-sm">— Site institucional e loja</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <a className="text-primary font-medium hover:underline" href="https://www.adeconex.com">
                  www.adeconex.com
                </a>
                <span className="text-muted-foreground text-sm">— Portal Adeconex Drivers</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
}
