import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function detectSource(): string {
  if (typeof document === "undefined") return "direto";
  const ref = document.referrer.toLowerCase();
  if (!ref) return "direto";
  if (ref.includes("whatsapp") || ref.includes("wa.me")) return "whatsapp";
  if (ref.includes("instagram")) return "instagram";
  if (ref.includes("facebook") || ref.includes("fb.com")) return "facebook";
  if (ref.includes("linkedin")) return "linkedin";
  if (ref.includes("twitter") || ref.includes("t.co") || ref.includes("x.com")) return "twitter";
  if (ref.includes("youtube")) return "youtube";
  if (ref.includes("google")) return "google";
  return "outros";
}

export default function ShortLinkRedirect() {
  const { code = "" } = useParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("short_links")
          .select("original_url, utm_source, utm_medium, utm_campaign, utm_content")
          .eq("code", code)
          .maybeSingle();
        if (cancelled) return;
        if (error || !data) {
          setError("Link não encontrado ou expirado.");
          return;
        }
        // fire-and-forget click registration
        (supabase as any).rpc("register_short_link_click", {
          _code: code,
          _source: detectSource(),
          _user_agent: navigator.userAgent,
        });
        const url = new URL(data.original_url);
        if (data.utm_source) url.searchParams.set("utm_source", data.utm_source);
        if (data.utm_medium) url.searchParams.set("utm_medium", data.utm_medium);
        if (data.utm_campaign) url.searchParams.set("utm_campaign", data.utm_campaign);
        if (data.utm_content) url.searchParams.set("utm_content", data.utm_content);
        window.location.replace(url.toString());
      } catch (e) {
        setError("Erro ao processar o link.");
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="font-heading text-2xl font-bold mb-2">
          {error ? "Link indisponível" : "Redirecionando..."}
        </h1>
        <p className="text-muted-foreground">
          {error || "Aguarde, você será encaminhado em instantes."}
        </p>
        {error && (
          <a href="/ferramentas/encurtador-url" className="text-primary underline mt-4 inline-block">
            Criar um novo link curto
          </a>
        )}
      </div>
    </div>
  );
}
