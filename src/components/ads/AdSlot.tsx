import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT, pushAd, logAdRender } from "@/lib/adsense";

type AdSlotProps = {
  /** Posição lógica (top, mid, bottom, sidebar, comments) — usada para logs. */
  position: "top" | "mid" | "bottom" | "sidebar" | "comments";
  /** Tipo da página onde está sendo exibido. */
  pageType?: string;
  /** ID do slot AdSense (data-ad-slot). Se omitido, usa Auto Ads (data-ad-format="auto"). */
  slot?: string;
  /** Formato. Default "auto" (responsivo). */
  format?: string;
  /** className adicional no wrapper. */
  className?: string;
  /** Altura mínima reservada para evitar CLS. */
  minHeight?: number;
  /** Texto sutil acima do anúncio (transparência). */
  label?: string;
};

/**
 * Slot de anúncio AdSense com lazy load via IntersectionObserver.
 * - Carrega apenas quando próximo da viewport.
 * - Reserva espaço (min-height) para evitar Cumulative Layout Shift.
 * - Registra logs de renderização.
 */
export function AdSlot({
  position,
  pageType,
  slot,
  format = "auto",
  className = "",
  minHeight = 100,
  label = "Publicidade",
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || !containerRef.current) return;
    const el = containerRef.current;
    const start = performance.now();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loaded) {
            const ok = pushAd();
            setLoaded(true);
            const loadTime = Math.round(performance.now() - start);
            logAdRender({
              position,
              pageType,
              status: ok ? "rendered" : "error",
              loadTimeMs: loadTime,
              errorMessage: ok ? undefined : "adsbygoogle push failed",
            });
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loaded, position, pageType]);

  return (
    <div
      ref={containerRef}
      className={`my-8 flex flex-col items-center ${className}`}
      style={{ minHeight }}
      aria-label="Anúncio"
    >
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">
        {label}
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight }}
        data-ad-client={ADSENSE_CLIENT}
        {...(slot ? { "data-ad-slot": slot } : {})}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
