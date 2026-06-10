import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEOHead";
import { AdSlot } from "@/components/ads/AdSlot";
import { MultiplexAd } from "@/components/ads/MultiplexAd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle, Copy, ExternalLink, QrCode, Download, RotateCcw,
  Check, Sparkles, Zap, TrendingUp, Building2, Bot, Share2,
  Instagram, Globe, Store, IdCard, ShoppingBag, Factory,
  HelpCircle, LifeBuoy, ShoppingCart, FileText, Briefcase, ThumbsUp,
  Phone, MessageSquare, Send, ArrowRight, CheckCircle2,
} from "lucide-react";
import { logToolUsage } from "@/lib/toolLogs";
import { toast } from "sonner";

const SLUG = "gerador-link-whatsapp";
const CANONICAL = "https://www.adeconex.com/ferramentas/gerador-link-whatsapp";

type Country = { code: string; ddi: string; name: string; mask: (d: string) => string; minLen: number; maxLen: number };

const COUNTRIES: Country[] = [
  {
    code: "BR", ddi: "55", name: "Brasil",
    mask: (d) => {
      const x = d.slice(0, 11);
      if (x.length <= 2) return x.length ? `(${x}` : "";
      if (x.length <= 7) return `(${x.slice(0, 2)}) ${x.slice(2)}`;
      return `(${x.slice(0, 2)}) ${x.slice(2, 7)}-${x.slice(7)}`;
    },
    minLen: 10, maxLen: 11,
  },
  { code: "US", ddi: "1", name: "Estados Unidos", mask: (d) => {
      const x = d.slice(0, 10);
      if (x.length <= 3) return x;
      if (x.length <= 6) return `(${x.slice(0, 3)}) ${x.slice(3)}`;
      return `(${x.slice(0, 3)}) ${x.slice(3, 6)}-${x.slice(6)}`;
    }, minLen: 10, maxLen: 10 },
  { code: "PT", ddi: "351", name: "Portugal", mask: (d) => {
      const x = d.slice(0, 9);
      return x.replace(/(\d{3})(\d{3})(\d{0,3})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" ")) || x;
    }, minLen: 9, maxLen: 9 },
  { code: "AR", ddi: "54", name: "Argentina", mask: (d) => d.slice(0, 11), minLen: 10, maxLen: 11 },
  { code: "PY", ddi: "595", name: "Paraguai", mask: (d) => d.slice(0, 10), minLen: 9, maxLen: 10 },
  { code: "ES", ddi: "34", name: "Espanha", mask: (d) => d.slice(0, 9), minLen: 9, maxLen: 9 },
  { code: "MX", ddi: "52", name: "México", mask: (d) => d.slice(0, 10), minLen: 10, maxLen: 10 },
  { code: "CL", ddi: "56", name: "Chile", mask: (d) => d.slice(0, 9), minLen: 9, maxLen: 9 },
  { code: "CO", ddi: "57", name: "Colômbia", mask: (d) => d.slice(0, 10), minLen: 10, maxLen: 10 },
  { code: "UY", ddi: "598", name: "Uruguai", mask: (d) => d.slice(0, 9), minLen: 8, maxLen: 9 },
];

const FAQS = [
  { q: "Como criar um link para WhatsApp?", a: "Escolha o país, digite o número e (opcional) uma mensagem automática. O link é gerado em tempo real, com QR Code e prévia da conversa. Basta copiar ou compartilhar." },
  { q: "Preciso salvar o número na agenda?", a: "Não. Esta é justamente a maior vantagem do padrão wa.me: qualquer pessoa pode iniciar a conversa apenas clicando no link, sem precisar adicionar o número aos contatos." },
  { q: "Funciona no WhatsApp Business?", a: "Sim. O link funciona em todas as versões do WhatsApp — pessoal, Business e Business API — sem nenhuma configuração extra." },
  { q: "Posso adicionar uma mensagem automática?", a: "Sim. Ao incluir uma mensagem, o link abre a conversa com o texto já pré-preenchido. O cliente só precisa tocar em enviar." },
  { q: "Posso criar um QR Code?", a: "Sim. Geramos um QR Code de alta resolução automaticamente, com exportação em PNG, JPG e PDF. Ideal para etiquetas, embalagens, cartões e materiais impressos." },
  { q: "Funciona em celular e computador?", a: "Sim. No celular abre o app do WhatsApp; no desktop abre o WhatsApp Web. A experiência é nativa em qualquer plataforma." },
  { q: "O link expira?", a: "Não. O link wa.me é permanente e oficial do WhatsApp. Continua válido enquanto o número estiver ativo." },
  { q: "É realmente gratuito?", a: "100% gratuito, sem cadastro, sem limite de uso e sem marca d'água. A Adeconex disponibiliza esta ferramenta gratuitamente como apoio ao mercado." },
];

const BENEFITS = [
  { icon: Zap, title: "Atendimento mais rápido", desc: "Reduza etapas entre o visitante e o seu vendedor." },
  { icon: TrendingUp, title: "Mais conversões", desc: "Facilite o contato imediato e capture leads quentes." },
  { icon: Building2, title: "WhatsApp Business", desc: "Funciona em todas as versões, sem configuração." },
  { icon: Bot, title: "Mensagens automáticas", desc: "Oriente a conversa desde a primeira palavra." },
  { icon: Share2, title: "Compartilhamento simples", desc: "Use em sites, redes sociais, anúncios e e-mails." },
  { icon: QrCode, title: "QR Code automático", desc: "Transforme o link em QR Code de alta resolução." },
];

const USE_CASES = [
  { icon: Instagram, title: "Instagram", desc: "Adicione o link na bio do seu perfil." },
  { icon: Globe, title: "Google Ads", desc: "Transforme cliques pagos em conversas reais." },
  { icon: Store, title: "Mercado Livre", desc: "Inclua QR Codes nas embalagens e etiquetas." },
  { icon: IdCard, title: "Cartão Digital", desc: "Contato instantâneo com um único toque." },
  { icon: ShoppingBag, title: "E-commerce", desc: "Atendimento comercial direto e rápido." },
  { icon: Factory, title: "Indústrias", desc: "Solicitações de orçamento simplificadas." },
];

const PRESETS: { icon: any; label: string; msg: string }[] = [
  { icon: FileText, label: "Solicitar orçamento", msg: "Olá! Gostaria de solicitar um orçamento." },
  { icon: LifeBuoy, label: "Suporte técnico", msg: "Olá! Preciso de suporte técnico, pode me ajudar?" },
  { icon: ShoppingCart, label: "Compra de produtos", msg: "Olá! Tenho interesse em adquirir alguns produtos." },
  { icon: HelpCircle, label: "Segunda via de pedido", msg: "Olá! Gostaria de solicitar a segunda via do meu pedido." },
  { icon: Briefcase, label: "Falar com vendedor", msg: "Olá! Gostaria de falar com um vendedor." },
  { icon: ThumbsUp, label: "Atendimento pós-venda", msg: "Olá! Estou entrando em contato sobre uma compra realizada." },
];

const RELATED = [
  { to: "/ferramentas/gerador-qrcode", icon: QrCode, title: "Gerador de QR Code", desc: "Gere QR Codes profissionais com logo e cores.", soon: false },
  { to: "#", icon: Share2, title: "Link da Bio", desc: "Uma página com todos os seus links.", soon: true },
  { to: "#", icon: ExternalLink, title: "Encurtador de URL", desc: "Links curtos para campanhas.", soon: true },
];

type RecentLink = { number: string; ddi: string; country: string; msg: string; url: string; date: string };
const RECENT_KEY = "adx_wa_recent_links";

function loadRecent(): RecentLink[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentLink[]) : [];
  } catch { return []; }
}

/* Animated counter — counts up when in view */
function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setStarted(true); });
    }, { threshold: 0.4 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const dur = 1600; const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString("pt-BR")}{suffix}</span>;
}

export default function WhatsAppLinkGeneratorPage() {
  const [countryCode, setCountryCode] = useState("BR");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState<RecentLink[]>([]);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const toolRef = useRef<HTMLDivElement>(null);

  const country = useMemo(() => COUNTRIES.find((c) => c.code === countryCode)!, [countryCode]);
  const digits = phone.replace(/\D/g, "");
  const isValid = digits.length >= country.minLen && digits.length <= country.maxLen;

  // Real-time link
  const liveLink = useMemo(() => {
    if (!isValid) return "";
    const text = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
    return `https://wa.me/${country.ddi}${digits}${text}`;
  }, [isValid, digits, country.ddi, message]);

  useEffect(() => { logToolUsage(SLUG, "page_view"); }, []);
  useEffect(() => { setRecent(loadRecent()); }, []);

  // Auto-render QR while typing (debounced)
  useEffect(() => {
    if (!liveLink || !qrCanvasRef.current) { setQrDataUrl(null); return; }
    const t = setTimeout(async () => {
      try {
        await QRCode.toCanvas(qrCanvasRef.current!, liveLink, {
          width: 600, margin: 2, errorCorrectionLevel: "H",
          color: { dark: "#128C7E", light: "#FFFFFF" },
        });
        setQrDataUrl(qrCanvasRef.current!.toDataURL("image/png"));
      } catch { setQrDataUrl(null); }
    }, 200);
    return () => clearTimeout(t);
  }, [liveLink]);

  function handlePhoneChange(v: string) {
    setPhone(country.mask(v.replace(/\D/g, "")));
  }
  useEffect(() => {
    setPhone((p) => country.mask(p.replace(/\D/g, "")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  function scrollToTool() {
    toolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function loadExample() {
    setCountryCode("BR");
    setPhone("(11) 99999-9999");
    setMessage("Olá! Gostaria de solicitar um orçamento.");
    scrollToTool();
  }

  function applyPreset(msg: string) {
    setMessage(msg);
    if (!phone) setPhone("(11) 99999-9999");
    scrollToTool();
    logToolUsage(SLUG, "preset_used", { preset: msg.slice(0, 40) });
  }

  function saveRecent() {
    if (!liveLink) return;
    const item: RecentLink = {
      number: `+${country.ddi} ${phone}`,
      ddi: country.ddi,
      country: country.name,
      msg: message.trim(),
      url: liveLink,
      date: new Date().toISOString(),
    };
    const next = [item, ...recent.filter((r) => r.url !== liveLink)].slice(0, 10);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
    logToolUsage(SLUG, "link_generated", { country: country.code, has_message: !!message.trim() });
  }

  async function handleCopy() {
    if (!liveLink) { toast.error("Preencha um número válido primeiro."); return; }
    try {
      await navigator.clipboard.writeText(liveLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copiado!");
      saveRecent();
      logToolUsage(SLUG, "link_copied");
    } catch { toast.error("Não foi possível copiar."); }
  }

  function handleOpen() {
    if (!liveLink) { toast.error("Preencha um número válido primeiro."); return; }
    window.open(liveLink, "_blank", "noopener,noreferrer");
    saveRecent();
    logToolUsage(SLUG, "link_opened");
  }

  function handleShare() {
    if (!liveLink) return;
    if (navigator.share) {
      navigator.share({ title: "Meu WhatsApp", url: liveLink }).catch(() => {});
      logToolUsage(SLUG, "link_shared");
    } else handleCopy();
  }

  function downloadQR(format: "png" | "jpg" | "pdf") {
    if (!qrDataUrl || !qrCanvasRef.current) { toast.error("Preencha um número válido primeiro."); return; }
    const canvas = qrCanvasRef.current;
    try {
      if (format === "png") {
        const a = document.createElement("a");
        a.href = qrDataUrl; a.download = `whatsapp-qr-${Date.now()}.png`; a.click();
      } else if (format === "jpg") {
        const tmp = document.createElement("canvas");
        tmp.width = canvas.width; tmp.height = canvas.height;
        const ctx = tmp.getContext("2d")!;
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, tmp.width, tmp.height);
        ctx.drawImage(canvas, 0, 0);
        const a = document.createElement("a");
        a.href = tmp.toDataURL("image/jpeg", 0.95);
        a.download = `whatsapp-qr-${Date.now()}.jpg`; a.click();
      } else {
        const pdf = new jsPDF({ unit: "mm", format: "a4" });
        const w = 120; const x = (210 - w) / 2;
        pdf.setFontSize(16);
        pdf.text("QR Code WhatsApp - Adeconex", 105, 25, { align: "center" });
        pdf.addImage(qrDataUrl, "PNG", x, 50, w, w);
        pdf.setFontSize(10);
        pdf.text(liveLink, 105, 185, { align: "center", maxWidth: 180 });
        pdf.save(`whatsapp-qr-${Date.now()}.pdf`);
      }
      logToolUsage(SLUG, `download_${format}`);
      toast.success(`QR Code salvo em ${format.toUpperCase()}.`);
    } catch (e) {
      toast.error("Falha ao baixar.");
      logToolUsage(SLUG, "download_error", { format }, (e as Error).message);
    }
  }

  function reuse(r: RecentLink) {
    const c = COUNTRIES.find((x) => x.ddi === r.ddi) || country;
    setCountryCode(c.code);
    const local = r.number.replace(/^\+\d+\s*/, "").replace(/\D/g, "");
    setPhone(c.mask(local));
    setMessage(r.msg);
    scrollToTool();
  }
  function clearRecent() { setRecent([]); try { localStorage.removeItem(RECENT_KEY); } catch {} }

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "SoftwareApplication",
      name: "Gerador de Link para WhatsApp",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "2184" },
      url: CANONICAL,
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: "https://www.adeconex.com/" },
        { "@type": "ListItem", position: 2, name: "Ferramentas", item: "https://www.adeconex.com/ferramentas" },
        { "@type": "ListItem", position: 3, name: "Gerador de Link para WhatsApp", item: CANONICAL },
      ],
    },
  ];

  const previewMsg = message.trim() || "Olá! Gostaria de solicitar um orçamento.";

  return (
    <Layout>
      <SEOHead
        title="Gerador de Link para WhatsApp Grátis | wa.me + QR Code"
        description="Crie links personalizados para WhatsApp com mensagem automática e QR Code em alta resolução. Ferramenta gratuita, profissional e compatível com WhatsApp Business."
        keywords="gerador de link whatsapp, link whatsapp personalizado, whatsapp sem salvar contato, criar link whatsapp, whatsapp business link, wa.me, qr code whatsapp, link bio whatsapp"
        canonical={CANONICAL}
        jsonLd={jsonLd}
      />

      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#1a6fc4]" />
        <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_15%_20%,white,transparent_45%),radial-gradient(circle_at_85%_75%,white,transparent_45%)]" />
        <div className="section-container relative py-14 md:py-20">
          <nav aria-label="breadcrumb" className="text-sm text-white/80 mb-5">
            <Link to="/" className="hover:text-white">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/ferramentas" className="hover:text-white">Ferramentas</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Gerador de Link para WhatsApp</span>
          </nav>

          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
            <div>
              <Badge className="bg-white/15 backdrop-blur text-white border border-white/20 mb-5 hover:bg-white/20">
                <Sparkles className="h-3 w-3 mr-1" /> 100% Grátis · Sem cadastro · Sem limite
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-5">
                Gerador de Link <span className="text-[#25D366]">para WhatsApp</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed mb-8">
                Crie links personalizados para WhatsApp com mensagens automáticas, QR Code
                e compartilhamento instantâneo — em segundos.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={scrollToTool} size="lg" className="bg-[#25D366] hover:bg-[#1ebe5b] text-white font-heading font-bold shadow-lg shadow-black/20">
                  <MessageCircle className="h-5 w-5" /> Gerar Link
                </Button>
                <Button onClick={loadExample} size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20 hover:text-white">
                  <Sparkles className="h-5 w-5" /> Ver Exemplo
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-7 text-sm text-white/85">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#25D366]" /> WhatsApp Business</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#25D366]" /> Mensagem pré-pronta</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#25D366]" /> QR Code PNG/JPG/PDF</span>
              </div>
            </div>

            {/* Phone mockup with WhatsApp chat */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 bg-white/10 blur-3xl rounded-full" />
                <div className="relative w-[300px] rounded-[2.5rem] bg-[#0b1418] border-[10px] border-[#0b1418] shadow-2xl overflow-hidden">
                  <div className="bg-[#128C7E] text-white px-4 py-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center font-bold">M</div>
                    <div className="text-sm leading-tight">
                      <div className="font-semibold">Maria Silva</div>
                      <div className="text-[11px] opacity-80">online</div>
                    </div>
                  </div>
                  <div className="bg-[#ECE5DD] min-h-[280px] p-3 space-y-2 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><path d=%22M0 30L30 0L60 30L30 60Z%22 fill=%22%23dcd4c8%22 fill-opacity=%220.35%22/></svg>')]">
                    <div className="ml-auto max-w-[80%] bg-[#DCF8C6] rounded-lg rounded-tr-sm px-3 py-2 text-[13px] text-[#111] shadow-sm">
                      Olá! Gostaria de solicitar um orçamento.
                      <div className="text-[10px] text-[#667] text-right mt-1">10:24 ✓✓</div>
                    </div>
                    <div className="max-w-[80%] bg-white rounded-lg rounded-tl-sm px-3 py-2 text-[13px] text-[#111] shadow-sm">
                      Claro! Posso te ajudar agora mesmo 😊
                      <div className="text-[10px] text-[#667] text-right mt-1">10:24</div>
                    </div>
                  </div>
                  <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
                    <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-[#999]">Mensagem</div>
                    <div className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center"><Send className="h-4 w-4 text-white" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-container py-12 md:py-16 space-y-16">
        {/* ============== TOOL (real-time) ============== */}
        <section ref={toolRef} className="scroll-mt-20">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6">
            {/* Config */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2 text-xl">
                  <Phone className="h-5 w-5 text-[#25D366]" /> Configure seu link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>País</Label>
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.name} (+{c.ddi})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número do WhatsApp</Label>
                  <Input
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={country.code === "BR" ? "(11) 99999-9999" : "Digite o número"}
                    aria-invalid={phone.length > 0 && !isValid}
                  />
                  <p className="text-xs text-muted-foreground">DDI +{country.ddi} é adicionado automaticamente.</p>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem automática (opcional)</Label>
                  <Textarea
                    rows={4}
                    value={message}
                    maxLength={1000}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Olá! Vim pelo site e gostaria de mais informações."
                  />
                  <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
                </div>

                {/* Live link */}
                <div className="space-y-2">
                  <Label>Seu link {isValid && <span className="text-[#25D366] text-xs ml-1">● ao vivo</span>}</Label>
                  <Input readOnly value={liveLink || "Preencha um número válido…"} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={handleCopy} variant="outline" disabled={!liveLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                  <Button onClick={handleShare} variant="outline" disabled={!liveLink}>
                    <Share2 className="h-4 w-4" /> Compartilhar
                  </Button>
                  <Button onClick={handleOpen} disabled={!liveLink} className="bg-[#25D366] hover:bg-[#1ebe5b] text-white">
                    <ExternalLink className="h-4 w-4" /> Abrir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live preview */}
            <Card className="border-border/60 shadow-sm bg-gradient-to-br from-muted/30 to-background">
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#128C7E]" /> Prévia em tempo real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
                  {/* Chat preview */}
                  <div className="rounded-2xl overflow-hidden border bg-[#0b1418] shadow-lg max-w-[260px] mx-auto">
                    <div className="bg-[#128C7E] text-white px-3 py-2 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                        {(country.name[0] || "W")}
                      </div>
                      <div className="text-xs leading-tight">
                        <div className="font-semibold">+{country.ddi} {phone || "número"}</div>
                        <div className="text-[10px] opacity-80">{isValid ? "online" : "aguardando…"}</div>
                      </div>
                    </div>
                    <div className="bg-[#ECE5DD] p-3 min-h-[160px]">
                      <div className="ml-auto max-w-[90%] bg-[#DCF8C6] rounded-lg rounded-tr-sm px-3 py-2 text-[12px] text-[#111] shadow-sm break-words">
                        {previewMsg}
                        <div className="text-[10px] text-[#667] text-right mt-1">agora ✓✓</div>
                      </div>
                    </div>
                  </div>
                  {/* QR */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`rounded-xl border-2 p-2 bg-white ${qrDataUrl ? "border-[#25D366]/40" : "border-dashed border-muted"}`}>
                      <canvas ref={qrCanvasRef} className={`w-[140px] h-[140px] ${qrDataUrl ? "" : "opacity-30"}`} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">QR Code</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5">
                  <Button size="sm" variant="outline" disabled={!qrDataUrl} onClick={() => downloadQR("png")}>
                    <Download className="h-4 w-4" /> PNG
                  </Button>
                  <Button size="sm" variant="outline" disabled={!qrDataUrl} onClick={() => downloadQR("jpg")}>
                    <Download className="h-4 w-4" /> JPG
                  </Button>
                  <Button size="sm" variant="outline" disabled={!qrDataUrl} onClick={() => downloadQR("pdf")}>
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {recent.length > 0 && (
            <Card className="mt-6 border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-lg">Links recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearRecent}>Limpar</Button>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {recent.map((r, i) => (
                    <li key={i} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{r.number} <span className="text-xs text-muted-foreground">· {r.country}</span></p>
                        <p className="text-xs text-muted-foreground truncate">{new Date(r.date).toLocaleString("pt-BR")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => reuse(r)}><RotateCcw className="h-3.5 w-3.5" /> Reutilizar</Button>
                        <Button size="sm" variant="outline" onClick={() => window.open(r.url, "_blank", "noopener,noreferrer")}><ExternalLink className="h-3.5 w-3.5" /> Abrir</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>

        {/* ============== BENEFITS ============== */}
        <section>
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">Benefícios</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Por que usar um link wa.me?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Reduza o atrito entre o visitante e o atendimento — em qualquer canal.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <Card key={b.title} className="border-border/60 hover:border-[#25D366]/40 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="h-11 w-11 rounded-xl bg-[#25D366]/10 text-[#128C7E] flex items-center justify-center mb-4">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <AdSlot position="mid" pageType="ferramenta-whatsapp" />

        {/* ============== USE CASES ============== */}
        <section>
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">Casos de uso</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Onde usar o seu link</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((u) => (
              <div key={u.title} className="group rounded-2xl border border-border/60 p-6 hover:border-primary/40 hover:shadow-md transition-all bg-card">
                <u.icon className="h-7 w-7 text-primary mb-3" />
                <h3 className="font-heading font-bold text-lg">{u.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{u.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============== PRESETS ============== */}
        <section>
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3">Exemplos prontos</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Mensagens em 1 clique</h2>
            <p className="text-muted-foreground mt-2">Preenchemos a mensagem para você. Basta ajustar o número.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.msg)}
                className="text-left rounded-xl border border-border/60 p-5 bg-card hover:border-[#25D366]/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p.icon className="h-5 w-5 text-[#128C7E]" />
                      <h3 className="font-heading font-semibold">{p.label}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground italic">"{p.msg}"</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#25D366] group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ============== HOW IT WORKS ============== */}
        <section className="rounded-3xl bg-gradient-to-br from-muted/40 to-background border border-border/60 p-8 md:p-12">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">Como funciona</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">3 etapas para começar</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: 1, icon: Phone, t: "Informe o número", d: "Selecione o país e digite o telefone com DDD." },
              { n: 2, icon: MessageSquare, t: "Digite a mensagem", d: "Opcional. Direcione o assunto desde o início." },
              { n: 3, icon: Send, t: "Copie ou compartilhe", d: "Pegue o link, QR Code ou abra direto no WhatsApp." },
            ].map((s) => (
              <div key={s.n} className="relative bg-card rounded-2xl border border-border/60 p-6">
                <div className="absolute -top-4 left-6 h-9 w-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white font-heading font-bold flex items-center justify-center shadow-md">
                  {s.n}
                </div>
                <s.icon className="h-7 w-7 text-[#128C7E] mb-3 mt-2" />
                <h3 className="font-heading font-bold text-lg">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ============== STATS ============== */}
        <section className="grid sm:grid-cols-3 gap-6 text-center">
          {[
            { n: 100, suffix: "B+", label: "mensagens enviadas por dia no WhatsApp" },
            { n: 200, suffix: "M+", label: "empresas usam o WhatsApp Business" },
            { n: 180, suffix: "+", label: "países com WhatsApp ativo" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-border/60 p-6 bg-card">
              <div className="font-heading font-extrabold text-4xl md:text-5xl text-[#128C7E]">
                <Counter to={s.n} suffix={s.suffix} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
            </div>
          ))}
        </section>

        {/* ============== SEO PREMIUM CONTENT ============== */}
        <section className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border/60">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">O que é um Link para WhatsApp?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/85 leading-relaxed">
              <p>
                Um <strong>link para WhatsApp</strong> é uma URL no padrão oficial <code className="text-[#128C7E] bg-muted px-1 rounded">wa.me</code>,
                criado pelo próprio WhatsApp para permitir que qualquer pessoa inicie uma conversa diretamente,
                sem precisar salvar o número de telefone na agenda. Esse formato funciona em todas as versões
                do app — incluindo o WhatsApp pessoal, o WhatsApp Business e a API oficial — em celulares Android,
                iPhone, computadores e tablets.
              </p>
              <p>
                Na prática, o link encurta o caminho entre o visitante e o atendimento. Em vez de o usuário
                copiar um número, abrir o aplicativo, criar um contato e iniciar a conversa, ele simplesmente
                clica no link e cai direto na tela de mensagem — com texto pré-preenchido, se você quiser.
                Esse atrito reduzido é exatamente o que faz do <em>wa.me</em> a ferramenta favorita de quem
                trabalha com <strong>geração de leads</strong>, atendimento comercial e marketing digital.
              </p>
              <p>
                Times de vendas, e-commerces, indústrias, agências e profissionais autônomos usam o link
                wa.me para canalizar contatos vindos de Google Ads, Meta Ads, Instagram, biolinks, e-mail
                marketing, sites institucionais, embalagens, etiquetas e cartões digitais. Ao adicionar uma
                <strong> mensagem automática</strong>, é possível orientar a conversa desde a primeira interação:
                "Quero um orçamento", "Preciso de suporte", "Tenho interesse no produto X" — o que aumenta a
                qualidade do lead e a velocidade do atendimento.
              </p>
              <p>
                Em termos de <strong>marketing digital</strong>, o link de WhatsApp é mensurável (via UTM e
                rastreio de cliques), permanente (não expira), e compatível com qualquer plataforma. Para
                quem trabalha com automação comercial — etiquetas, ribbons, impressão térmica, balanças,
                códigos de barras — o link transformado em QR Code também viabiliza ações offline poderosas:
                basta apontar a câmera do celular para iniciar a conversa.
              </p>

              <h3 className="font-heading text-xl font-bold pt-4">Como criar um Link para WhatsApp?</h3>
              <p>
                Criar um link wa.me leva menos de 30 segundos com a ferramenta da Adeconex. O processo é:
                selecionar o país (que define o DDI automaticamente), digitar o número com DDD, opcionalmente
                escrever uma mensagem automática e copiar o link gerado. O link, o QR Code e a prévia da
                conversa aparecem em tempo real, sem necessidade de cadastro ou login.
              </p>
              <p>
                Quem busca <em>criar link whatsapp</em>, <em>gerar link whatsapp</em>, <em>whatsapp sem salvar
                contato</em> ou <em>whatsapp business link</em> encontra tudo o que precisa nesta página:
                geração instantânea, exportação de QR Code em PNG, JPG e PDF de alta resolução, exemplos
                prontos para diferentes cenários e suporte a múltiplos países.
              </p>

              <h3 className="font-heading text-xl font-bold pt-4">Como usar em campanhas de marketing?</h3>
              <p>
                O link wa.me funciona em praticamente todos os canais de marketing digital. No <strong>Google Ads</strong>,
                use-o como URL final de campanhas de geração de leads. No <strong>Meta Ads</strong> (Facebook e Instagram),
                aplique como link de destino em anúncios de tráfego ou conversão. No <strong>Instagram</strong>, coloque-o
                na bio ou em stories com sticker de link. Em <strong>e-mail marketing</strong>, adicione como CTA no
                rodapé ou em assinaturas. Para ações <strong>offline</strong>, gere o QR Code e imprima em cartões digitais,
                embalagens, etiquetas, totens, vitrines e materiais promocionais — uma das aplicações mais comuns
                entre clientes Adeconex.
              </p>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card className="border-border/60 bg-gradient-to-br from-[#25D366]/5 to-transparent">
              <CardContent className="pt-6">
                <h3 className="font-heading font-bold text-lg mb-3">Palavras-chave atendidas</h3>
                <div className="flex flex-wrap gap-2">
                  {["criar link whatsapp","gerar link whatsapp","whatsapp sem salvar contato","whatsapp business link","wa.me","qr code whatsapp","link bio whatsapp"].map((k) => (
                    <Badge key={k} variant="secondary" className="font-normal">{k}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="pt-6 space-y-3 text-sm">
                <h3 className="font-heading font-bold text-lg">Compatibilidade</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2"><Check className="h-4 w-4 text-[#25D366] mt-0.5" /> WhatsApp pessoal</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-[#25D366] mt-0.5" /> WhatsApp Business</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-[#25D366] mt-0.5" /> WhatsApp Business API</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-[#25D366] mt-0.5" /> WhatsApp Web e Desktop</li>
                  <li className="flex gap-2"><Check className="h-4 w-4 text-[#25D366] mt-0.5" /> Android, iOS, Windows, macOS</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <AdSlot position="bottom" pageType="ferramenta-whatsapp" />

        {/* ============== FAQ ============== */}
        <section className="max-w-4xl mx-auto w-full">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3">FAQ</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Perguntas Frequentes</h2>
          </div>
          <Accordion type="single" collapsible className="w-full bg-card border border-border/60 rounded-2xl px-5">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="border-border/60 last:border-0">
                <AccordionTrigger className="text-left font-heading font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ============== RELATED TOOLS ============== */}
        <section>
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3">Ferramentas relacionadas</Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Continue explorando</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {RELATED.map((r) => {
              const Inner = (
                <div className={`h-full rounded-2xl border border-border/60 p-6 bg-card transition-all ${r.soon ? "opacity-70" : "hover:border-primary/40 hover:shadow-md"}`}>
                  <div className="flex items-start justify-between">
                    <r.icon className="h-7 w-7 text-primary mb-3" />
                    {r.soon && <Badge variant="outline" className="text-[10px]">Em breve</Badge>}
                  </div>
                  <h3 className="font-heading font-bold text-lg">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                  {!r.soon && (
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-3">
                      Acessar <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              );
              return r.soon
                ? <div key={r.title}>{Inner}</div>
                : <Link key={r.title} to={r.to}>{Inner}</Link>;
            })}
          </div>
        </section>

        <MultiplexAd pageType="ferramenta-whatsapp" />

        {/* ============== LEAD CTA ============== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#1a6fc4] to-[#128C7E] text-primary-foreground p-10 md:p-14 text-center shadow-xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,white,transparent_45%),radial-gradient(circle_at_80%_70%,white,transparent_45%)]" />
          <div className="relative">
            <Badge className="bg-white/15 backdrop-blur text-white border border-white/20 mb-4">
              Adeconex · Soluções para empresas
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-3 leading-tight max-w-3xl mx-auto">
              Precisa divulgar seu WhatsApp em produtos, etiquetas ou embalagens?
            </h2>
            <p className="text-white/90 mb-7 max-w-2xl mx-auto text-lg">
              A Adeconex oferece soluções completas para identificação, rastreabilidade e
              automação empresarial — etiquetas, ribbons, impressoras e suporte técnico especializado.
            </p>
            <a href="https://www.adeconex.com.br" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="cta-gradient border-0 text-secondary-foreground font-heading font-bold shadow-lg">
                Solicitar orçamento <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>
      </div>
    </Layout>
  );
}
