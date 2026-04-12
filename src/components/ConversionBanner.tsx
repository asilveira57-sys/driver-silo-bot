import { ShoppingCart, ArrowRight } from "lucide-react";

interface ConversionBannerProps {
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

export function ConversionBanner({
  title = "Precisa de etiquetas, ribbons ou impressoras?",
  description = "Acesse nossa loja online e encontre os melhores produtos para impressão térmica.",
  buttonText = "Visitar Loja Adeconex",
  href = "https://www.adeconex.com.br",
}: ConversionBannerProps) {
  return (
    <section className="hero-gradient rounded-xl p-8 md:p-10 text-primary-foreground">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="p-3 rounded-full bg-primary-foreground/10">
          <ShoppingCart className="h-8 w-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-heading text-xl font-bold">{title}</h3>
          <p className="text-primary-foreground/80 mt-1">{description}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="download-btn text-base whitespace-nowrap"
        >
          {buttonText}
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
