import { Layout } from "@/components/layout/Layout";
import { ReactNode } from "react";

interface Props {
  title: string;
  updated?: string;
  intro?: ReactNode;
  children: ReactNode;
}

export function LegalLayout({ title, updated = "Maio de 2026", intro, children }: Props) {
  return (
    <Layout>
      <section className="hero-gradient py-12 md:py-16">
        <div className="section-container text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-black text-primary-foreground">{title}</h1>
          <p className="mt-3 text-sm text-primary-foreground/80">Última atualização: {updated}</p>
        </div>
      </section>
      <section className="section-container py-12 md:py-16">
        <article className="max-w-3xl mx-auto prose prose-lg prose-headings:font-heading prose-headings:text-primary prose-a:text-primary text-foreground">
          {intro && <div className="mb-6">{intro}</div>}
          {children}
        </article>
      </section>
    </Layout>
  );
}
