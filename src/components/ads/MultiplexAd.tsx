import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT, pushAd, logAdRender } from "@/lib/adsense";

type Props = {
  slot?: string;
  pageType?: string;
  title?: string;
};

/**
 * Multiplex (Related Content) — bloco que mistura monetização com navegação.
 * Renderiza após o artigo.
 */
export function MultiplexAd({ slot, pageType, title = "Conteúdo Relacionado" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || !ref.current) return;
    const el = ref.current;
    const start = performance.now();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !loaded) {
            const ok = pushAd();
            setLoaded(true);
            logAdRender({
              position: "bottom",
              pageType,
              status: ok ? "rendered" : "error",
              loadTimeMs: Math.round(performance.now() - start),
            });
            obs.disconnect();
          }
        });
      },
      { rootMargin: "300px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loaded, pageType]);

  return (
    <section ref={ref} className="my-10" aria-label="Conteúdo relacionado patrocinado">
      <h2 className="text-lg font-heading font-bold text-foreground mb-3">{title}</h2>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: 250 }}
        data-ad-format="autorelaxed"
        data-ad-client={ADSENSE_CLIENT}
        {...(slot ? { "data-ad-slot": slot } : {})}
      />
    </section>
  );
}
