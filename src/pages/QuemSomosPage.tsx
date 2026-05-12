import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { ConversionBanner } from "@/components/ConversionBanner";
import { CheckCircle2, Mail, Phone, Globe, MessageCircle } from "lucide-react";

export default function QuemSomosPage() {
  const valores = [
    "Compromisso com informação confiável",
    "Transparência nas relações",
    "Evolução tecnológica contínua",
    "Respeito aos usuários e clientes",
    "Agilidade e suporte ao mercado",
    "Busca constante por melhoria operacional",
  ];

  return (
    <Layout>
      <SEOHead
        title="Quem Somos"
        description="Conheça a Adeconex: portal técnico de drivers, softwares e materiais para impressão térmica, etiquetas, ribbons e automação comercial."
        canonical="https://www.adeconex.com/quem-somos"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Quem Somos - Adeconex",
          url: "https://www.adeconex.com/quem-somos",
          about: {
            "@type": "Organization",
            name: "Adeconex",
            url: "https://www.adeconex.com.br",
            email: "vendas@adeconex.com.br",
            telephone: "+55-27-3318-6565",
          },
        }}
      />

      <section className="hero-gradient py-16 md:py-20">
        <div className="section-container text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-black text-primary-foreground">
            Quem Somos
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/85 max-w-2xl mx-auto">
            Bem-vindo ao portal da Adeconex.
          </p>
        </div>
      </section>

      <section className="section-container py-12 md:py-16">
        <article className="prose prose-lg max-w-3xl mx-auto text-foreground">
          <p>
            A Adeconex atua há anos no segmento de identificação, impressão térmica e soluções para etiquetas, ribbons e automação comercial, atendendo empresas de diversos portes em todo o Brasil. Ao longo dessa trajetória, construímos experiência prática no suporte a impressoras térmicas, configuração de equipamentos e operação de sistemas voltados para logística, ecommerce, indústria, varejo e marketplace.
          </p>
          <p>
            O portal Adeconex Drivers foi criado com o objetivo de facilitar o acesso a drivers, softwares, utilitários e materiais de apoio utilizados no dia a dia de empresas e profissionais que trabalham com impressão térmica e automação. Sabemos que muitas vezes encontrar arquivos confiáveis e compatíveis pode ser um processo demorado. Por isso, reunimos em um único ambiente conteúdos organizados para auxiliar usuários de diferentes níveis de experiência.
          </p>
          <p>
            Nossa plataforma disponibiliza arquivos e informações relacionadas a diversas marcas e modelos de impressoras térmicas, incluindo equipamentos utilizados para impressão de etiquetas adesivas, código de barras, fita de cetim, pulseiras, etiquetas de logística e identificação industrial.
          </p>
          <p>
            Além dos downloads, também buscamos compartilhar conteúdos técnicos, orientações e materiais educativos que ajudam na instalação, configuração e utilização correta dos equipamentos. O objetivo é tornar o processo mais simples, reduzir dificuldades operacionais e apoiar empresas que dependem da impressão térmica em suas rotinas.
          </p>
          <p>
            A Adeconex também atua fortemente no universo do ecommerce e marketplace, acompanhando a evolução tecnológica do setor e desenvolvendo soluções voltadas para produtividade, automação e escalabilidade operacional. Essa experiência prática permite que nossos conteúdos sejam produzidos com foco real nas necessidades enfrentadas por lojistas, operadores logísticos, papelarias, indústrias e profissionais do segmento.
          </p>
          <p>
            Nosso compromisso é manter um ambiente confiável, organizado e continuamente atualizado, oferecendo arquivos úteis, conteúdo relevante e uma experiência segura para quem acessa nossa plataforma.
          </p>
        </article>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
          <div className="silo-card">
            <h2 className="font-heading font-bold text-xl text-primary mb-2">Nossa missão</h2>
            <p className="text-muted-foreground">
              Facilitar o acesso a soluções, informações técnicas e ferramentas relacionadas à impressão térmica e automação comercial, contribuindo para a produtividade e eficiência operacional de empresas em todo o Brasil.
            </p>
          </div>
          <div className="silo-card">
            <h2 className="font-heading font-bold text-xl text-primary mb-2">Nossa visão</h2>
            <p className="text-muted-foreground">
              Ser uma referência nacional em conteúdo técnico, suporte informativo e distribuição de materiais relacionados à impressão térmica, automação e identificação.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8 silo-card">
          <h2 className="font-heading font-bold text-xl text-primary mb-4">Nossos valores</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {valores.map((v) => (
              <li key={v} className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="max-w-4xl mx-auto mt-8 silo-card">
          <h2 className="font-heading font-bold text-xl text-primary mb-4">Contato</h2>
          <p className="text-muted-foreground mb-4">
            Caso tenha dúvidas, sugestões ou precise de suporte relacionado ao portal, entre em contato pelos canais oficiais da Adeconex.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3"><Globe className="h-5 w-5 text-primary" /><a className="hover:underline" href="https://www.adeconex.com.br" target="_blank" rel="noopener">www.adeconex.com.br</a></li>
            <li className="flex items-center gap-3"><Globe className="h-5 w-5 text-primary" /><a className="hover:underline" href="https://www.adeconex.com">www.adeconex.com</a></li>
            <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary" /><a className="hover:underline" href="mailto:vendas@adeconex.com.br">vendas@adeconex.com.br</a></li>
            <li className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><span>(27) 3318-6565</span></li>
            <li className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-primary" /><span>WhatsApp: (27) 3318-6565</span></li>
          </ul>
        </div>

        <div className="mt-12">
          <ConversionBanner />
        </div>
      </section>
    </Layout>
  );
}
