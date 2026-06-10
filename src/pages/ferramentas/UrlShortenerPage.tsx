import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { AdSlot } from "@/components/ads/AdSlot";
import { MultiplexAd } from "@/components/ads/MultiplexAd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { logToolUsage } from "@/lib/toolLogs";
import { toast } from "@/hooks/use-toast";
import {
  Link2, Copy, ExternalLink, QrCode, Share2, Check, BarChart3, Calendar,
  MousePointerClick, Sparkles, Zap, ShieldCheck, ImageDown, FileDown,
  MessageCircle, Instagram, Facebook, Linkedin, Youtube, Mail, ShoppingBag,
  Wand2, Tag, ArrowRight, TrendingUp, Send, Target, Smartphone, Search,
  Music2, Store, ArrowDown,
} from "lucide-react";

const TOOL_SLUG = "encurtador-url";
const SITE_ORIGIN = typeof window !== "undefined" ? window.location.origin : "https://www.adeconex.com";

type ShortLink = {
  code: string;
  original_url: string;
  custom?: boolean;
  created_at: string;
  utm?: { source?: string; medium?: string; campaign?: string; content?: string };
};

const LS_KEY = "adeconex_short_links";

function loadLocal(): ShortLink[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveLocal(list: ShortLink[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 20))); } catch {}
}
function randomCode(len = 6) {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  let s = ""; for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}
function isValidUrl(u: string) {
  try { const x = new URL(u); return x.protocol === "http:" || x.protocol === "https:"; } catch { return false; }
}
function isValidCustom(c: string) { return /^[a-z0-9-]{3,40}$/i.test(c); }

export default function UrlShortenerPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [customAvail, setCustomAvail] = useState<"idle" | "checking" | "free" | "taken" | "invalid">("idle");
  const [utm, setUtm] = useState({ source: "", medium: "", campaign: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortLink | null>(null);
  const [qrData, setQrData] = useState<string>("");
  const [history, setHistory] = useState<ShortLink[]>([]);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ clicks: number; last_click_at: string | null } | null>(null);
  const [sources, setSources] = useState<Record<string, number>>({});
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { logToolUsage(TOOL_SLUG, "view"); setHistory(loadLocal()); }, []);

  // Real-time custom code availability
  useEffect(() => {
    if (!customCode) { setCustomAvail("idle"); return; }
    if (!isValidCustom(customCode)) { setCustomAvail("invalid"); return; }
    setCustomAvail("checking");
    const t = setTimeout(async () => {
      const { data } = await (supabase as any).from("short_links").select("code").eq("code", customCode.toLowerCase()).maybeSingle();
      setCustomAvail(data ? "taken" : "free");
    }, 350);
    return () => clearTimeout(t);
  }, [customCode]);

  const shortUrl = useMemo(() => result ? `${SITE_ORIGIN}/l/${result.code}` : "", [result]);

  // Auto QR
  useEffect(() => {
    if (!shortUrl) { setQrData(""); return; }
    QRCode.toDataURL(shortUrl, { width: 320, margin: 1, color: { dark: "#1a6fc4", light: "#ffffff" } })
      .then(setQrData).catch(() => setQrData(""));
    if (qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, shortUrl, { width: 1024, margin: 2 }).catch(() => {});
    }
  }, [shortUrl]);

  // Refresh stats periodically
  useEffect(() => {
    if (!result) { setStats(null); setSources({}); return; }
    const fetchStats = async () => {
      const { data } = await (supabase as any).from("short_links").select("clicks,last_click_at").eq("code", result.code).maybeSingle();
      if (data) setStats({ clicks: data.clicks, last_click_at: data.last_click_at });
      const { data: rows } = await (supabase as any).from("short_link_clicks").select("source").eq("code", result.code);
      if (rows) {
        const agg: Record<string, number> = {};
        rows.forEach((r: any) => { agg[r.source] = (agg[r.source] || 0) + 1; });
        setSources(agg);
      }
    };
    fetchStats();
    const i = setInterval(fetchStats, 8000);
    return () => clearInterval(i);
  }, [result]);

  async function handleShorten() {
    if (!isValidUrl(originalUrl)) {
      toast({ title: "URL inválida", description: "Inclua http:// ou https://", variant: "destructive" });
      logToolUsage(TOOL_SLUG, "validation_error", { reason: "invalid_url" });
      return;
    }
    if (customCode && customAvail === "taken") {
      toast({ title: "Slug indisponível", description: "Escolha outro nome personalizado.", variant: "destructive" });
      return;
    }
    if (customCode && customAvail === "invalid") {
      toast({ title: "Slug inválido", description: "Use 3 a 40 caracteres: letras, números, hífen.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      let code = customCode ? customCode.toLowerCase() : randomCode();
      // retry random a couple times on collision
      for (let attempt = 0; attempt < 3 && !customCode; attempt++) {
        const { data: exists } = await (supabase as any).from("short_links").select("code").eq("code", code).maybeSingle();
        if (!exists) break;
        code = randomCode(7);
      }
      const payload: any = {
        code,
        original_url: originalUrl,
        utm_source: utm.source || null,
        utm_medium: utm.medium || null,
        utm_campaign: utm.campaign || null,
        utm_content: utm.content || null,
      };
      const { data, error } = await (supabase as any).from("short_links").insert(payload).select().single();
      if (error) throw error;
      const link: ShortLink = {
        code: data.code,
        original_url: data.original_url,
        custom: !!customCode,
        created_at: data.created_at,
        utm: { ...utm },
      };
      setResult(link);
      const next = [link, ...history.filter((h) => h.code !== link.code)];
      setHistory(next); saveLocal(next);
      logToolUsage(TOOL_SLUG, "shorten", { code: link.code, custom: !!customCode, has_utm: Boolean(utm.source || utm.medium || utm.campaign) });
      toast({ title: "Link curto criado!", description: `${SITE_ORIGIN}/l/${data.code}` });
      setTimeout(() => document.getElementById("result-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e: any) {
      logToolUsage(TOOL_SLUG, "shorten_error", undefined, e?.message);
      toast({ title: "Erro ao criar link", description: e?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function copyShort() {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
    logToolUsage(TOOL_SLUG, "copy");
    toast({ title: "Copiado!", description: shortUrl });
  }

  async function shareLink() {
    if (!shortUrl) return;
    logToolUsage(TOOL_SLUG, "share");
    if (navigator.share) {
      try { await navigator.share({ title: "Link curto Adeconex", url: shortUrl }); } catch {}
    } else {
      copyShort();
    }
  }

  function downloadQR(format: "png" | "jpg" | "pdf") {
    if (!qrCanvasRef.current || !shortUrl) return;
    logToolUsage(TOOL_SLUG, `export_${format}`);
    if (format === "pdf") {
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const img = qrCanvasRef.current.toDataURL("image/png");
      pdf.setFontSize(16); pdf.text("QR Code - Adeconex", 60, 60);
      pdf.setFontSize(10); pdf.text(shortUrl, 60, 80);
      pdf.addImage(img, "PNG", 60, 100, 400, 400);
      pdf.save(`qrcode-${result?.code}.pdf`);
      return;
    }
    const mime = format === "jpg" ? "image/jpeg" : "image/png";
    const url = qrCanvasRef.current.toDataURL(mime, 0.95);
    const a = document.createElement("a");
    a.href = url; a.download = `qrcode-${result?.code}.${format}`; a.click();
  }

  const utmPreview = useMemo(() => {
    const parts: string[] = [];
    if (utm.source) parts.push(`utm_source=${encodeURIComponent(utm.source)}`);
    if (utm.medium) parts.push(`utm_medium=${encodeURIComponent(utm.medium)}`);
    if (utm.campaign) parts.push(`utm_campaign=${encodeURIComponent(utm.campaign)}`);
    if (utm.content) parts.push(`utm_content=${encodeURIComponent(utm.content)}`);
    return parts.join("&");
  }, [utm]);

  const canonical = "https://www.adeconex.com/ferramentas/encurtador-url";

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Encurtador de URL Inteligente Adeconex",
      applicationCategory: "WebApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      url: canonical,
      description: "Encurtador de URL gratuito com QR Code, link personalizado, UTM builder e estatísticas de cliques.",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: "https://www.adeconex.com/" },
        { "@type": "ListItem", position: 2, name: "Ferramentas", item: "https://www.adeconex.com/ferramentas" },
        { "@type": "ListItem", position: 3, name: "Encurtador de URL", item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "O encurtador é gratuito?", acceptedAnswer: { "@type": "Answer", text: "Sim. Você pode encurtar quantas URLs quiser, sem custo e sem cadastro." } },
        { "@type": "Question", name: "Posso personalizar o link?", acceptedAnswer: { "@type": "Answer", text: "Sim. Escolha um final personalizado, como /l/promocao-junho." } },
        { "@type": "Question", name: "O link expira?", acceptedAnswer: { "@type": "Answer", text: "Não. Os links permanecem ativos enquanto a ferramenta estiver disponível." } },
        { "@type": "Question", name: "Posso acompanhar cliques?", acceptedAnswer: { "@type": "Answer", text: "Sim. A ferramenta registra cliques totais, último acesso e origem (WhatsApp, Instagram, Facebook, Direto)." } },
        { "@type": "Question", name: "Funciona no WhatsApp e Instagram?", acceptedAnswer: { "@type": "Answer", text: "Sim. URLs curtas são ideais para WhatsApp, biografia do Instagram, Stories e descrições do YouTube." } },
        { "@type": "Question", name: "Posso gerar QR Code?", acceptedAnswer: { "@type": "Answer", text: "Sim. Cada link encurtado gera automaticamente um QR Code para download em PNG, JPG ou PDF." } },
      ],
    },
  ];

  const useCases = [
    { icon: MessageCircle, title: "WhatsApp", text: "Links menores transmitem mais confiança nas conversas." },
    { icon: Instagram, title: "Instagram", text: "Ideal para bio, Stories e descrições de Reels." },
    { icon: Youtube, title: "YouTube", text: "URLs limpas na descrição dos vídeos." },
    { icon: ShoppingBag, title: "Mercado Livre / Shopee", text: "Compartilhamento rápido de produtos e ofertas." },
    { icon: Mail, title: "E-mail Marketing", text: "URLs profissionais que aumentam a entregabilidade." },
    { icon: Facebook, title: "Facebook / LinkedIn", text: "Compartilhe em redes profissionais sem poluir o texto." },
  ];

  const examples = [
    { label: "Link para WhatsApp", value: "https://wa.me/5511999999999?text=Ol%C3%A1" },
    { label: "Link para Produto", value: "https://www.adeconex.com.br/produtos/ribbon-resina-premium" },
    { label: "Link para Landing Page", value: "https://www.adeconex.com.br/promocoes" },
    { label: "Link para Vídeo", value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { label: "Link para Formulário", value: "https://forms.gle/exemplo" },
  ];

  return (
    <Layout>
      <SEOHead
        title="Encurtador de URL Grátis | Crie Links Curtos e Compartilháveis"
        description="Transforme URLs longas em links curtos, fáceis de compartilhar e compatíveis com redes sociais, WhatsApp, Instagram e campanhas de marketing."
        keywords="encurtador de url, link curto, criar link curto, tinyurl, bitly, encurtar link, url curta, link personalizado"
        canonical={canonical}
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700 text-primary-foreground">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_60%,white,transparent_40%)]" />
        <div className="section-container relative py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/15 text-white border-white/20">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> 100% Gratuito • Sem cadastro
            </Badge>
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Encurtador de URL Inteligente
            </h1>
            <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto mb-8">
              Transforme links longos em URLs curtas, profissionais e fáceis de compartilhar — com QR Code, UTM e rastreamento de cliques.
            </p>

            <div className="bg-white/95 rounded-2xl shadow-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
              <Input
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="Cole sua URL aqui — ex.: https://www.adeconex.com.br/produtos/ribbon-resina-premium"
                className="h-14 text-base md:text-lg border-0 focus-visible:ring-0 text-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
              />
              <Button
                onClick={handleShorten}
                disabled={loading}
                className="h-14 px-8 cta-gradient border-0 text-secondary-foreground font-heading font-bold text-base"
              >
                {loading ? "Encurtando..." : (<><Zap className="h-5 w-5 mr-1" /> Encurtar URL</>)}
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm opacity-90">
              <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Links permanentes</span>
              <span className="flex items-center gap-1"><QrCode className="h-4 w-4" /> QR Code automático</span>
              <span className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /> Estatísticas de cliques</span>
              <span className="flex items-center gap-1"><Tag className="h-4 w-4" /> UTM builder</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-container py-10 space-y-12">

        {/* RESULT */}
        {result && (
          <Card id="result-card" className="border-primary/30 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-green-500/15 text-green-600 flex items-center justify-center"><Check className="h-5 w-5" /></div>
                <CardTitle className="text-2xl">Seu link curto está pronto</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Link Original</p>
                    <p className="text-sm break-all bg-muted p-3 rounded-md">{result.original_url}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Link Curto</p>
                    <div className="flex items-center gap-2 bg-primary/5 border-2 border-primary/30 p-4 rounded-lg">
                      <Link2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-mono text-lg font-semibold text-primary truncate">{shortUrl}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={copyShort} variant={copied ? "secondary" : "default"}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={shortUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> Abrir</a>
                    </Button>
                    <Button variant="outline" onClick={shareLink}><Share2 className="h-4 w-4" /> Compartilhar</Button>
                  </div>

                  {stats && (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <MousePointerClick className="h-5 w-5 mx-auto text-primary mb-1" />
                        <p className="text-2xl font-bold">{stats.clicks}</p>
                        <p className="text-xs text-muted-foreground">Cliques</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                        <p className="text-sm font-semibold">{new Date(result.created_at).toLocaleDateString("pt-BR")}</p>
                        <p className="text-xs text-muted-foreground">Criado em</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <BarChart3 className="h-5 w-5 mx-auto text-primary mb-1" />
                        <p className="text-sm font-semibold">{stats.last_click_at ? new Date(stats.last_click_at).toLocaleDateString("pt-BR") : "—"}</p>
                        <p className="text-xs text-muted-foreground">Último clique</p>
                      </div>
                    </div>
                  )}

                  {Object.keys(sources).length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Origem dos cliques</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(sources).map(([k, v]) => (
                          <Badge key={k} variant="secondary" className="capitalize">{k}: {v}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">QR Code</p>
                  <div className="bg-white p-4 rounded-lg border flex items-center justify-center">
                    {qrData ? <img src={qrData} alt="QR Code" className="w-full max-w-[220px]" /> : <div className="h-44" />}
                    <canvas ref={qrCanvasRef} className="hidden" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadQR("png")}><ImageDown className="h-4 w-4" /> PNG</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadQR("jpg")}><ImageDown className="h-4 w-4" /> JPG</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadQR("pdf")}><FileDown className="h-4 w-4" /> PDF</Button>
                  </div>
                </div>
              </div>

              {/* Social preview */}
              <Separator />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Pré-visualização em redes sociais</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { Icon: MessageCircle, name: "WhatsApp", bg: "bg-emerald-500" },
                    { Icon: Instagram, name: "Instagram", bg: "bg-pink-500" },
                    { Icon: Facebook, name: "Facebook", bg: "bg-blue-600" },
                    { Icon: Linkedin, name: "LinkedIn", bg: "bg-sky-700" },
                  ].map(({ Icon, name, bg }) => (
                    <div key={name} className="border rounded-lg p-3 bg-card">
                      <div className="flex items-center gap-2 mb-2"><div className={`h-7 w-7 rounded-full ${bg} text-white flex items-center justify-center`}><Icon className="h-4 w-4" /></div><span className="text-sm font-semibold">{name}</span></div>
                      <p className="text-xs text-muted-foreground truncate">Confira: {shortUrl}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CONFIG: custom + UTM */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" /> Link personalizado</CardTitle>
              <CardDescription>Crie URLs memoráveis para campanhas e produtos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="custom">Final do link</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">{SITE_ORIGIN}/l/</span>
                <Input id="custom" value={customCode} onChange={(e) => setCustomCode(e.target.value.replace(/\s/g, ""))} placeholder="promocao-junho" />
              </div>
              <div className="h-5 text-xs">
                {customAvail === "checking" && <span className="text-muted-foreground">Verificando disponibilidade...</span>}
                {customAvail === "free" && <span className="text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Disponível</span>}
                {customAvail === "taken" && <span className="text-destructive">Indisponível, tente outro.</span>}
                {customAvail === "invalid" && <span className="text-destructive">Use 3–40 caracteres: letras, números e hífen.</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-primary" /> Criador de UTM</CardTitle>
              <CardDescription>Adicione parâmetros de campanha automaticamente.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              <div><Label>Source</Label><Input value={utm.source} onChange={(e) => setUtm({ ...utm, source: e.target.value })} placeholder="instagram" /></div>
              <div><Label>Medium</Label><Input value={utm.medium} onChange={(e) => setUtm({ ...utm, medium: e.target.value })} placeholder="social" /></div>
              <div><Label>Campaign</Label><Input value={utm.campaign} onChange={(e) => setUtm({ ...utm, campaign: e.target.value })} placeholder="promo-junho" /></div>
              <div><Label>Content</Label><Input value={utm.content} onChange={(e) => setUtm({ ...utm, content: e.target.value })} placeholder="banner-1" /></div>
              {utmPreview && (
                <div className="sm:col-span-2 text-xs font-mono bg-muted p-2 rounded break-all">?{utmPreview}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Examples */}
        <div>
          <h2 className="font-heading text-2xl font-bold mb-3">Exemplos prontos</h2>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <Button key={ex.label} variant="outline" size="sm" onClick={() => setOriginalUrl(ex.value)}>
                {ex.label}
              </Button>
            ))}
          </div>
        </div>

        {/* SECTION 1 — What is */}
        <section className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm">
              <Link2 className="h-7 w-7" />
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">O que é um Encurtador de URL?</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Uma ferramenta que transforma endereços longos em links curtos, elegantes e fáceis de compartilhar — perfeitos para redes sociais, WhatsApp, e-mail marketing e campanhas pagas.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary/5 via-card to-blue-50 rounded-2xl border p-6 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">URL Original</p>
            <p className="font-mono text-sm break-all bg-card border rounded-lg p-3 text-muted-foreground">
              https://www.adeconex.com.br/produtos/ribbon-resina-premium-110x450mm
            </p>
            <div className="flex justify-center my-3">
              <div className="h-9 w-9 rounded-full cta-gradient text-white flex items-center justify-center shadow-md animate-bounce">
                <ArrowDown className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">URL Curta</p>
            <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-lg p-3">
              <Link2 className="h-5 w-5 text-primary shrink-0" />
              <span className="font-mono font-semibold text-primary">adeconex.com/l/ribbon</span>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Benefits */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">Benefícios</h2>
            <p className="text-muted-foreground">Por que milhares de profissionais escolhem links curtos.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: TrendingUp, title: "Mais Cliques", text: "Links curtos geram maior confiança e melhor CTR.", color: "text-emerald-600", bg: "bg-emerald-500/10" },
              { icon: Sparkles, title: "Aparência Profissional", text: "URLs limpas melhoram a comunicação.", color: "text-amber-600", bg: "bg-amber-500/10" },
              { icon: Send, title: "Compartilhamento Fácil", text: "Ideal para WhatsApp, Instagram e e-mail.", color: "text-blue-600", bg: "bg-blue-500/10" },
              { icon: Target, title: "Melhor Rastreamento", text: "Acompanhe campanhas com parâmetros UTM.", color: "text-rose-600", bg: "bg-rose-500/10" },
              { icon: Smartphone, title: "Compatível com Redes Sociais", text: "Funciona em qualquer plataforma.", color: "text-violet-600", bg: "bg-violet-500/10" },
              { icon: QrCode, title: "QR Code Automático", text: "Transforme links em QR Codes instantaneamente.", color: "text-primary", bg: "bg-primary/10" },
            ].map(({ icon: Icon, title, text, color, bg }) => (
              <div key={title} className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`h-12 w-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 — Where to use */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">Onde Utilizar</h2>
            <p className="text-muted-foreground">Use em qualquer canal de marketing ou comunicação.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Instagram, name: "Instagram", color: "from-pink-500 to-rose-500" },
              { icon: Search, name: "Google Ads", color: "from-blue-500 to-cyan-500" },
              { icon: Facebook, name: "Facebook Ads", color: "from-blue-600 to-indigo-600" },
              { icon: MessageCircle, name: "WhatsApp", color: "from-emerald-500 to-green-600" },
              { icon: Music2, name: "TikTok", color: "from-slate-800 to-slate-900" },
              { icon: Store, name: "E-commerce", color: "from-amber-500 to-orange-500" },
            ].map(({ icon: Icon, name, color }) => (
              <div key={name} className="group rounded-2xl border bg-card p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`h-12 w-12 mx-auto rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold">{name}</p>
              </div>
            ))}
          </div>
        </section>

        <AdSlot position="mid" pageType="ferramenta-encurtador-url" />

        {/* SECTION 4 — How it works */}
        <section className="rounded-3xl bg-gradient-to-br from-muted/40 via-card to-primary/5 border p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">Como Funciona</h2>
            <p className="text-muted-foreground">Três passos para criar um link curto profissional.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "1", title: "Cole a URL", text: "Insira o link longo que deseja encurtar." },
              { n: "2", title: "Personalize o link", text: "Escolha um final memorável ou use UTM." },
              { n: "3", title: "Copie e compartilhe", text: "Use em qualquer canal com QR Code grátis." },
            ].map(({ n, title, text }) => (
              <div key={n} className="relative bg-card rounded-2xl border p-6 shadow-sm hover:shadow-lg transition-shadow text-center">
                <div className="mx-auto mb-3 h-16 w-16 rounded-full cta-gradient text-white flex items-center justify-center font-heading font-bold text-3xl shadow-lg">
                  {n}
                </div>
                <h3 className="font-heading font-bold text-xl mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5 — Premium resources */}
        <section>
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">Recursos Avançados</h2>
            <p className="text-muted-foreground">Tudo que você precisa em uma única ferramenta gratuita.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Link personalizado", "QR Code integrado", "Parâmetros UTM",
              "Estatísticas de acesso", "Compartilhamento rápido", "Compatível com campanhas",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Check className="h-5 w-5" />
                </div>
                <span className="font-semibold">{feat}</span>
              </div>
            ))}
          </div>
        </section>

        <MultiplexAd pageType="ferramenta-encurtador-url" />

        {/* FAQ */}
        <div>
          <h2 className="font-heading text-3xl font-bold mb-4">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              ["O encurtador é gratuito?", "Sim. Você pode encurtar quantas URLs quiser, sem custo e sem cadastro."],
              ["Posso personalizar o link?", "Sim. Use o campo de link personalizado para criar URLs como /l/promocao-junho."],
              ["O link expira?", "Não. Os links permanecem ativos enquanto a ferramenta estiver disponível."],
              ["Posso acompanhar cliques?", "Sim. A ferramenta registra cliques totais, último acesso e origem do tráfego (WhatsApp, Instagram, Facebook, Direto)."],
              ["Funciona no WhatsApp?", "Sim. URLs curtas são ideais para conversas, listas de transmissão e campanhas no WhatsApp."],
              ["Funciona no Instagram?", "Sim. Use na bio, em Stories com link e na descrição de Reels."],
              ["Posso gerar QR Code?", "Sim. Cada link encurtado gera um QR Code de alta resolução para download em PNG, JPG ou PDF."],
            ].map(([q, a], i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Recent links */}
        {history.length > 0 && (
          <div>
            <h2 className="font-heading text-2xl font-bold mb-3">Links criados recentemente</h2>
            <div className="space-y-2">
              {history.slice(0, 10).map((h) => (
                <div key={h.code} className="flex items-center justify-between gap-3 p-3 border rounded-lg bg-card">
                  <div className="min-w-0">
                    <p className="font-mono text-sm text-primary truncate">{SITE_ORIGIN}/l/{h.code}</p>
                    <p className="text-xs text-muted-foreground truncate">{h.original_url}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(`${SITE_ORIGIN}/l/${h.code}`); toast({ title: "Copiado!" }); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        <div>
          <h2 className="font-heading text-2xl font-bold mb-4">Ferramentas relacionadas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RouterLink to="/ferramentas/gerador-link-whatsapp" className="block">
              <Card className="silo-card h-full"><CardHeader><MessageCircle className="h-6 w-6 text-primary mb-2" /><CardTitle className="text-base">Gerador de Link WhatsApp</CardTitle></CardHeader></Card>
            </RouterLink>
            <RouterLink to="/ferramentas/gerador-qrcode" className="block">
              <Card className="silo-card h-full"><CardHeader><QrCode className="h-6 w-6 text-primary mb-2" /><CardTitle className="text-base">Gerador de QR Code</CardTitle></CardHeader></Card>
            </RouterLink>
            <Card className="silo-card h-full opacity-70"><CardHeader><Link2 className="h-6 w-6 text-primary mb-2" /><CardTitle className="text-base">Link da Bio</CardTitle><CardDescription>Em breve</CardDescription></CardHeader></Card>
            <Card className="silo-card h-full opacity-70"><CardHeader><ImageDown className="h-6 w-6 text-primary mb-2" /><CardTitle className="text-base">Conversor de Imagens</CardTitle><CardDescription>Em breve</CardDescription></CardHeader></Card>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-primary-foreground p-8 md:p-12 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">Precisa divulgar produtos, serviços ou campanhas?</h2>
          <p className="opacity-95 mb-6 max-w-2xl mx-auto">A Adeconex oferece soluções completas para automação, identificação, etiquetas e rastreabilidade.</p>
          <a href="https://www.adeconex.com.br" target="_blank" rel="noopener">
            <Button size="lg" className="cta-gradient border-0 text-secondary-foreground font-heading font-bold">
              Solicitar orçamento <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </a>
        </div>
      </div>
    </Layout>
  );
}
