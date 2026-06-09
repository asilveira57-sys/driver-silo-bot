// AdSense helpers — script é carregado uma única vez no index.html.
// As funções aqui apenas inicializam slots e registram logs/métricas.
import { supabase } from "@/integrations/supabase/client";

export const ADSENSE_CLIENT = "ca-pub-2204887945491050";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export function pushAd(): boolean {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    return true;
  } catch (e) {
    console.warn("[AdSense] push failed", e);
    return false;
  }
}

export function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export async function logAdRender(params: {
  position: string;
  pageType?: string;
  status: "rendered" | "error" | "blocked";
  loadTimeMs?: number;
  errorMessage?: string;
  adBlockerDetected?: boolean;
}) {
  try {
    await supabase.from("adsense_render_logs").insert({
      page_url: typeof window !== "undefined" ? window.location.pathname : "",
      page_type: params.pageType,
      position: params.position,
      device: detectDevice(),
      status: params.status,
      load_time_ms: params.loadTimeMs,
      error_message: params.errorMessage,
      ad_blocker_detected: params.adBlockerDetected ?? false,
    });
  } catch {
    // não bloquear a renderização por falha de log
  }
}

export async function detectAdBlock(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
      { method: "HEAD", mode: "no-cors", cache: "no-store" }
    );
    return false;
  } catch {
    return true;
  }
}
