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
  Check, Sparkles, Smartphone, Building2, ShoppingCart,
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
  { q: "Como criar um link para WhatsApp?", a: "Selecione o país, informe o número e clique em Gerar Link. Você pode opcionalmente adicionar uma mensagem automática que será preenchida ao abrir a conversa." },
  { q: "Preciso instalar algum aplicativo?", a: "Não. O link funciona diretamente no WhatsApp Web (computador) e no aplicativo do WhatsApp (celular). Quem clicar não precisa ter seu número salvo na agenda." },
  { q: "Funciona com WhatsApp Business?", a: "Sim. O padrão wa.me funciona tanto no WhatsApp tradicional quanto no WhatsApp Business, sem nenhuma configuração adicional." },
  { q: "Posso adicionar uma mensagem automática?", a: "Sim. Ao informar uma mensagem, a ferramenta gera o link já com o texto pré-preenchido para o cliente apenas confirmar e enviar." },
  { q: "O QR Code funciona em qualquer celular?", a: "Sim. Qualquer celular com câmera abre o QR Code: basta apontar a câmera e tocar na notificação para iniciar a conversa." },
  { q: "Posso usar este link em anúncios e redes sociais?", a: "Sim. O link wa.me é oficial do WhatsApp e pode ser usado em Google Ads, Facebook Ads, Instagram, biolinks, sites, e-mails e materiais impressos com QR Code." },
];

type RecentLink = { number: string; ddi: string; country: string; msg: string; url: string; date: string };

const RECENT_KEY = "adx_wa_recent_links";

function loadRecent(): RecentLink[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as RecentLink[]) : [];
  } catch { return []; }
}

export default function WhatsAppLinkGeneratorPage() {
  const [countryCode, setCountryCode] = useState("BR");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recent, setRecent] = useState<RecentLink[]>([]);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const country = useMemo(() => COUNTRIES.find((c) => c.code === countryCode)!, [countryCode]);
  const digits = phone.replace(/\D/g, "");
  const isValid = digits.length >= country.minLen && digits.length <= country.maxLen;

  useEffect(() => { logToolUsage(SLUG, "page_view"); }, []);
  useEffect(() => { setRecent(loadRecent()); }, []);

  function handlePhoneChange(v: string) {
    const onlyDigits = v.replace(/\D/g, "");
    setPhone(country.mask(onlyDigits));
  }

  useEffect(() => {
    setPhone((p) => country.mask(p.replace(/\D/g, "")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  function buildLink(): string {
    const full = `${country.ddi}${digits}`;
    const text = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
    return `https://wa.me/${full}${text}`;
  }

  async function handleGenerate() {
    if (!isValid) {
      toast.error("Número inválido. Verifique a quantidade de dígitos para o país selecionado.");
      logToolUsage(SLUG, "validation_error", { country: country.code, length: digits.length });
      return;
    }
    const link = buildLink();
    setGenerated(link);
    setQrDataUrl(null);

    const newItem: RecentLink = {
      number: `+${country.ddi} ${phone}`,
      ddi: country.ddi,
      country: country.name,
      msg: message.trim(),
      url: link,
      date: new Date().toISOString(),
    };
    const next = [newItem, ...recent.filter((r) => r.url !== link)].slice(0, 10);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}

    logToolUsage(SLUG, "link_generated", { country: country.code, has_message: !!message.trim() });
    toast.success("Link gerado com sucesso!");
  }

  async function handleCopy() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copiado com sucesso.");
      logToolUsage(SLUG, "link_copied");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }

  function handleOpen() {
    if (!generated) return;
    window.open(generated, "_blank", "noopener,noreferrer");
    logToolUsage(SLUG, "link_opened");
  }

  async function handleGenerateQR() {
    if (!generated) return;
    try {
      const canvas = qrCanvasRef.current!;
      await QRCode.toCanvas(canvas, generated, {
        width: 600, margin: 2, errorCorrectionLevel: "H",
        color: { dark: "#128C7E", light: "#FFFFFF" },
      });
      const data = canvas.toDataURL("image/png");
      setQrDataUrl(data);
      logToolUsage(SLUG, "qr_generated");
    } catch (e) {
      toast.error("Erro ao gerar QR Code.");
      logToolUsage(SLUG, "qr_error", undefined, (e as Error).message);
    }
  }

  function downloadQR(format: "png" | "jpg" | "pdf") {
    if (!qrDataUrl || !qrCanvasRef.current) {
      toast.error("Gere o QR Code primeiro.");
      return;
    }
    const canvas = qrCanvasRef.current;
    try {
      if (format === "png") {
        const a = document.createElement("a");
        a.href = qrDataUrl;
        a.download = `whatsapp-qr-${Date.now()}.png`;
        a.click();
      } else if (format === "jpg") {
        const tmp = document.createElement("canvas");
        tmp.width = canvas.width; tmp.height = canvas.height;
        const ctx = tmp.getContext("2d")!;
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, tmp.width, tmp.height);
        ctx.drawImage(canvas, 0, 0);
        const url = tmp.toDataURL("image/jpeg", 0.95);
        const a = document.createElement("a");
        a.href = url;
        a.download = `whatsapp-qr-${Date.now()}.jpg`;
        a.click();
      } else {
        const pdf = new jsPDF({ unit: "mm", format: "a4" });
        const w = 120;
        const x = (210 - w) / 2;
        pdf.setFontSize(16);
        pdf.text("QR Code WhatsApp - Adeconex", 105, 25, { align: "center" });
        pdf.addImage(qrDataUrl, "PNG", x, 50, w, w);
        pdf.setFontSize(10);
        pdf.text(generated || "", 105, 185, { align: "center", maxWidth: 180 });
        pdf.save(`whatsapp-qr-${Date.now()}.pdf`);
      }
      logToolUsage(SLUG, `download_${format}`);
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
    setGenerated(r.url);
    setQrDataUrl(null);
  }

  function clearRecent() {
    setRecent([]);
    try { localStorage.removeItem(RECENT_KEY); } catch {}
  }

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "SoftwareApplication",
      name: "Gerador de Link para WhatsApp",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
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

  return (
    <Layout>
      <SEOHead
        title="Gerador de Link para WhatsApp Grátis"
        description="Crie links personalizados para WhatsApp com mensagem automática. Ferramenta gratuita, rápida e compatível com WhatsApp Business."
        keywords="gerador de link whatsapp, link whatsapp personalizado, whatsapp sem salvar contato, criar link whatsapp, whatsapp business link, wa.me, ferramenta whatsapp"
        canonical={CANONICAL}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366] text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_80%,white,transparent_40%)]" />
        <div className="section-container relative py-16 md:py-20">
          <nav aria-label="breadcrumb" className="text-sm opacity-90 mb-4">
            <Link to="/" className="hover:underline">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/ferramentas" className="hover:underline">Ferramentas</Link>
            <span className="mx-2">/</span>
            <span>Gerador de Link para WhatsApp</span>
          </nav>
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-4">
                <Sparkles className="h-3 w-3 mr-1" /> 100% Grátis · Sem cadastro
              </Badge>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Gerador de Link para WhatsApp
              </h1>
              <p className="text-base md:text-lg opacity-95 max-w-xl">
                Crie um link personalizado para iniciar conversas no WhatsApp sem precisar
                salvar o número na agenda. Inclui mensagem automática e QR Code para download.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 text-sm">
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> WhatsApp Business</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Mensagem automática</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> QR Code PNG/JPG/PDF</span>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <MessageCircle className="h-32 w-32 text-white" strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-container py-10 space-y-10">
        {/* Tool */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          <Card className="silo-card">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#25D366]" /> Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>País</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name} (+{c.ddi})
                      </SelectItem>
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
                <p className="text-xs text-muted-foreground">
                  Não use espaços nem caracteres especiais — a ferramenta limpa automaticamente.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Mensagem automática (opcional)</Label>
                <Textarea
                  rows={4}
                  value={message}
                  maxLength={1000}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Olá! Vim através do site e gostaria de mais informações."
                />
                <p className="text-xs text-muted-foreground">{message.length}/1000</p>
              </div>

              <Button
                onClick={handleGenerate}
                size="lg"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5b] text-white font-heading font-bold"
              >
                <MessageCircle className="h-5 w-5" /> Gerar Link
              </Button>
            </CardContent>
          </Card>

          <Card className="silo-card">
            <CardHeader>
              <CardTitle className="font-heading">Resultado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!generated ? (
                <div className="border-2 border-dashed rounded-lg p-10 text-center text-muted-foreground">
                  <QrCode className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Preencha o número e clique em <strong>Gerar Link</strong>.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Link gerado</Label>
                    <Input readOnly value={generated} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleCopy} variant="outline">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copiado" : "Copiar Link"}
                    </Button>
                    <Button onClick={handleOpen} className="bg-[#25D366] hover:bg-[#1ebe5b] text-white">
                      <ExternalLink className="h-4 w-4" /> Abrir WhatsApp
                    </Button>
                  </div>

                  <div className="pt-2 border-t">
                    <Button onClick={handleGenerateQR} variant="secondary" className="w-full">
                      <QrCode className="h-4 w-4" /> Gerar QR Code
                    </Button>
                    <div className="mt-4 flex justify-center">
                      <canvas
                        ref={qrCanvasRef}
                        className={qrDataUrl ? "max-w-[220px] w-full h-auto rounded border" : "hidden"}
                      />
                    </div>
                    {qrDataUrl && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => downloadQR("png")}>
                          <Download className="h-4 w-4" /> PNG
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadQR("jpg")}>
                          <Download className="h-4 w-4" /> JPG
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadQR("pdf")}>
                          <Download className="h-4 w-4" /> PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent */}
        {recent.length > 0 && (
          <Card className="silo-card">
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
                      <Button size="sm" variant="outline" onClick={() => reuse(r)}>
                        <RotateCcw className="h-3.5 w-3.5" /> Reutilizar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(r.url, "_blank", "noopener,noreferrer")}>
                        <ExternalLink className="h-3.5 w-3.5" /> Abrir
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <AdSlot position="mid" pageType="ferramenta-whatsapp" />

        {/* Examples */}
        <section>
          <h2 className="font-heading text-2xl font-bold mb-4">Exemplos de Uso</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6">
              <Building2 className="h-6 w-6 text-[#128C7E] mb-2" />
              <h3 className="font-heading font-semibold">Atendimento Comercial</h3>
              <p className="text-xs font-mono text-muted-foreground break-all mt-2">https://wa.me/5511999999999</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <Smartphone className="h-6 w-6 text-[#128C7E] mb-2" />
              <h3 className="font-heading font-semibold">Suporte Técnico</h3>
              <p className="text-xs font-mono text-muted-foreground break-all mt-2">https://wa.me/5511988888888?text=Preciso%20de%20ajuda</p>
            </CardContent></Card>
            <Card><CardContent className="pt-6">
              <ShoppingCart className="h-6 w-6 text-[#128C7E] mb-2" />
              <h3 className="font-heading font-semibold">Vendas / Marketplace</h3>
              <p className="text-xs font-mono text-muted-foreground break-all mt-2">https://wa.me/5511977777777?text=Gostaria%20de%20um%20orçamento</p>
            </CardContent></Card>
          </div>
        </section>

        {/* SEO content */}
        <article className="prose prose-slate max-w-none">
          <h2 className="font-heading">O que é um Link para WhatsApp?</h2>
          <p>
            Um link para WhatsApp (formato <strong>wa.me</strong>) é uma URL oficial fornecida pelo
            próprio WhatsApp que permite iniciar uma conversa com qualquer número diretamente,
            sem que o usuário precise salvar o contato na agenda. Basta clicar e a conversa abre
            no aplicativo (celular) ou no WhatsApp Web (computador).
          </p>

          <h2 className="font-heading">Como funciona o padrão wa.me?</h2>
          <p>
            O padrão segue a estrutura <code>https://wa.me/[DDI][DDD][NÚMERO]</code>. Para enviar
            uma mensagem pré-preenchida, basta adicionar <code>?text=mensagem</code> ao final, com
            o texto codificado. Por exemplo: <code>https://wa.me/5511999999999?text=Ol%C3%A1</code>.
            O Gerador de Link da Adeconex cuida automaticamente da codificação para você.
          </p>

          <h2 className="font-heading">Benefícios de usar um link de WhatsApp</h2>
          <ul>
            <li><strong>Mais praticidade</strong> — clientes iniciam o contato com um clique.</li>
            <li><strong>Aumento da conversão</strong> — reduz o atrito entre a visita e o atendimento.</li>
            <li><strong>Melhor experiência</strong> — sem necessidade de salvar contatos.</li>
            <li><strong>Ideal para anúncios</strong> — funciona em Google Ads, Meta Ads, Instagram e e-mails.</li>
            <li><strong>Mensagem pronta</strong> — você pode pré-direcionar o assunto da conversa.</li>
          </ul>

          <h2 className="font-heading">Quem pode utilizar?</h2>
          <ul>
            <li>Empresas e indústrias</li>
            <li>E-commerces e marketplaces</li>
            <li>Prestadores de serviço</li>
            <li>Consultores, agências e profissionais autônomos</li>
            <li>Equipes de SAC e suporte técnico</li>
          </ul>
        </article>

        <AdSlot position="bottom" pageType="ferramenta-whatsapp" />

        {/* FAQ */}
        <section>
          <h2 className="font-heading text-2xl font-bold mb-4">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`}>
                <AccordionTrigger className="text-left font-heading">{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <MultiplexAd pageType="ferramenta-whatsapp" />

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-primary to-[#1a6fc4] text-primary-foreground p-8 md:p-10 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Precisa de etiquetas, ribbons ou soluções de automação?
          </h2>
          <p className="opacity-95 mb-6 max-w-2xl mx-auto">
            Conheça os produtos da Adeconex — distribuição oficial e suporte técnico especializado
            em impressão térmica, etiquetas e automação para o varejo.
          </p>
          <a href="https://www.adeconex.com.br" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="cta-gradient border-0 text-secondary-foreground font-heading font-bold">
              Visitar Adeconex <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </section>
      </div>
    </Layout>
  );
}
