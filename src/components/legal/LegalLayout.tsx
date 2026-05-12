import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ChevronRight, CalendarDays } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  title: string;
  eyebrow?: string;
  updated?: string;
  intro?: ReactNode;
  children: ReactNode;
}

export function LegalLayout({
  title,
  eyebrow = "Portal Oficial Adeconex Drivers",
  updated = "Maio de 2026",
  intro,
  children,
}: Props) {
  return (
    <Layout>
      {/* Hero claro institucional */}
      <section className="relative bg-gradient-to-b from-accent/40 via-background to-background border-b border-border">
        <div className="section-container py-12 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground mb-5"
          >
            <Link to="/" className="hover:text-primary transition-colors">
              Início
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground/80">{title}</span>
          </nav>

          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            {eyebrow}
          </p>
          <h1 className="font-heading font-black text-3xl md:text-5xl text-foreground leading-tight max-w-3xl">
            {title}
          </h1>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs md:text-sm text-muted-foreground shadow-sm">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span>
              Última atualização: <strong className="text-foreground">{updated}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="bg-background">
        <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {intro && (
            <aside className="mb-10 rounded-xl border border-border bg-card/60 p-5 md:p-6 shadow-sm">
              <div className="legal-prose text-base md:text-[17px] text-foreground/90">
                {intro}
              </div>
            </aside>
          )}
          <article className="legal-prose">{children}</article>
        </div>
      </section>
    </Layout>
  );
}
