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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download, QrCode, Loader2, Check, CheckCircle2, AlertCircle, Sparkles,
  CreditCard, Package, Tag, Monitor, FileImage, FileText, Image as ImageIcon, FileCode2, Lock
} from "lucide-react";
import { logToolUsage } from "@/lib/toolLogs";
import { toast } from "sonner";

const SLUG = "gerador-qrcode";
const CANONICAL = "https://www.adeconex.com/ferramentas/gerador-qrcode";

type ContentType = "url" | "texto" | "telefone" | "whatsapp" | "email" | "pix" | "wifi";

const PRESET_COLORS: Record<string, string> = {
  preto: "#000000",
  azul: "#1a6fc4",
  vermelho: "#C41E3A",
  verde: "#10b981",
};

const FAQS: { q: string; a: string }[] = [
  { q: "O gerador de QR Code é gratuito?", a: "Sim. O gerador de QR Code da Adeconex é 100% gratuito, sem cadastro, sem marca d'água e liberado para uso comercial em embalagens, etiquetas, cartões e materiais impressos ou digitais." },
  { q: "Posso colocar minha logo no QR Code?", a: "Sim. Faça upload de uma imagem PNG, JPG ou SVG e ela será inserida no centro do QR Code. Usamos correção de erro nível H para preservar a leitura mesmo com o logo aplicado." },
  { q: "Posso baixar em PDF?", a: "Sim. Geramos um PDF em formato A4 com o QR Code centralizado, ideal para impressão profissional em gráficas." },
  { q: "Posso baixar em PNG?", a: "Sim. O download em PNG suporta fundo transparente e alta resolução até 2000 x 2000 pixels (ou personalizada)." },
  { q: "Posso baixar em SVG?", a: "Sim. O SVG é um formato vetorial: escala para qualquer tamanho sem perda de qualidade — perfeito para etiquetas, banners e materiais gráficos." },
  { q: "Qual o melhor tamanho para impressão?", a: "Para impressão em etiquetas pequenas (2 a 3 cm), use 500 px. Para embalagens maiores ou displays, 1000 px ou mais. Para materiais editoriais ou banners, prefira o formato SVG." },
  { q: "QR Code funciona em etiquetas adesivas?", a: "Sim, e é uma das aplicações mais comuns. Garanta contraste alto, mínimo 2 cm e teste a leitura após a impressão térmica ou offset." },
  { q: "QR Code funciona em embalagens?", a: "Sim. Em embalagens é recomendado contrastar com a cor de fundo, evitar curvaturas extremas no ponto de leitura e manter margem branca de pelo menos 4 mm ao redor." },
  { q: "Posso usar QR Code para Pix?", a: "Sim. Cole o código Pix Copia e Cola na aba 'Pix' e gere o QR. Compatível com todos os bancos brasileiros e carteiras digitais." },
  { q: "Posso usar QR Code para WhatsApp?", a: "Sim. Na aba 'WhatsApp' informe o número com DDI (ex.: 5511999990000) e, opcionalmente, uma mensagem pré-preenchida." },
];

type Quality = { level: "Excelente" | "Boa" | "Regular" | "Ruim"; color: string; icon: typeof Check; tips: string[] };

export default function QRCodeGeneratorPage() {
  const [contentType, setContentType] = useState<ContentType>("url");
  const [url, setUrl] = useState("https://www.adeconex.com.br");
  const [texto, setTexto] = useState("");
  const [telefone, setTelefone] = useState("");
  const [waNumber, setWaNumber] = useState("");
  const [waMsg, setWaMsg] = useState("");
  const [email, setEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [pixCode, setPixCode] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiAuth, setWifiAuth] = useState<"WPA" | "WEP" | "nopass">("WPA");

  const [colorPreset, setColorPreset] = useState<string>("preto");
  const [customColor, setCustomColor] = useState("#000000");
  const [bgTransparent, setBgTransparent] = useState(false);
  const [size, setSize] = useState<number>(500);
  const [customSize, setCustomSize] = useState<number>(500);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [pngBytes, setPngBytes] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);

  const fgColor = colorPreset === "personalizada" ? customColor : PRESET_COLORS[colorPreset];

  useEffect(() => {
    logToolUsage(SLUG, "page_view");
  }, []);

  // Hero preview QR (decorative, fixed link to adeconex)
  useEffect(() => {
    if (heroCanvasRef.current) {
      QRCode.toCanvas(heroCanvasRef.current, "https://www.adeconex.com.br", {
        width: 260, margin: 2, errorCorrectionLevel: "H",
        color: { dark: "#1a6fc4", light: "#FFFFFF" },
      });
    }
  }, []);

  useEffect(() => {
    if (!logoFile) { setLogoDataUrl(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => setLogoDataUrl(e.target?.result as string);
    reader.readAsDataURL(logoFile);
    logToolUsage(SLUG, "logo_upload", { name: logoFile.name, size: logoFile.size });
  }, [logoFile]);

  function buildPayload(): string {
    switch (contentType) {
      case "url": return url.trim();
      case "texto": return texto;
      case "telefone": return `tel:${telefone.replace(/\D/g, "")}`;
      case "whatsapp": {
        const n = waNumber.replace(/\D/g, "");
        const m = encodeURIComponent(waMsg);
        return `https://wa.me/${n}${m ? `?text=${m}` : ""}`;
      }
      case "email": {
        const s = emailSubject ? `?subject=${encodeURIComponent(emailSubject)}` : "";
        return `mailto:${email}${s}`;
      }
      case "pix": return pixCode.trim();
      case "wifi": return `WIFI:T:${wifiAuth};S:${wifiSsid};P:${wifiPass};;`;
    }
  }

  async function handleGenerate() {
    const payload = buildPayload();
    if (!payload) {
      logToolUsage(SLUG, "validation_error", { contentType }, "empty payload");
      toast.error("Preencha o conteúdo do QR Code.");
      return;
    }
    const finalSize = size === 0 ? customSize : size;
    setGenerating(true);
    try {
      const canvas = canvasRef.current!;
      await QRCode.toCanvas(canvas, payload, {
        width: finalSize,
        margin: 2,
        color: { dark: fgColor, light: bgTransparent ? "#00000000" : "#FFFFFF" },
        errorCorrectionLevel: "H",
      });
      if (logoDataUrl) await drawLogo(canvas, logoDataUrl, finalSize);
      setGenerated(true);
      // preview small data url for mockups
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewDataUrl(dataUrl);
      // approx file size
      const approxBytes = Math.round((dataUrl.length - "data:image/png;base64,".length) * 3 / 4);
      setPngBytes(approxBytes);
      logToolUsage(SLUG, "generate", { contentType, size: finalSize, hasLogo: !!logoDataUrl, color: fgColor, bgTransparent });
      toast.success("QR Code gerado com sucesso!");
    } catch (e: any) {
      logToolUsage(SLUG, "generate_error", { contentType }, e?.message);
      toast.error("Erro ao gerar QR Code.");
    } finally {
      setGenerating(false);
    }
  }

  function drawLogo(canvas: HTMLCanvasElement, dataUrl: string, finalSize: number): Promise<void> {
    return new Promise((resolve) => {
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      img.onload = () => {
        const logoSize = Math.round(finalSize * 0.2);
        const x = (canvas.width - logoSize) / 2;
        const y = (canvas.height - logoSize) / 2;
        ctx.fillStyle = "#FFFFFF";
        const pad = 6;
        ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2);
        ctx.drawImage(img, x, y, logoSize, logoSize);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = dataUrl;
    });
  }

  function exportPNG() { downloadFromCanvas("png"); }
  function exportJPG() { downloadFromCanvas("jpg"); }

  function downloadFromCanvas(fmt: "png" | "jpg") {
    if (!canvasRef.current || !generated) { toast.error("Gere o QR Code primeiro."); return; }
    try {
      const mime = fmt === "png" ? "image/png" : "image/jpeg";
      let canvas = canvasRef.current;
      if (fmt === "jpg" && bgTransparent) {
        const tmp = document.createElement("canvas");
        tmp.width = canvas.width; tmp.height = canvas.height;
        const c = tmp.getContext("2d")!;
        c.fillStyle = "#FFFFFF"; c.fillRect(0, 0, tmp.width, tmp.height);
        c.drawImage(canvas, 0, 0);
        canvas = tmp;
      }
      const url = canvas.toDataURL(mime, 1.0);
      triggerDownload(url, `qrcode.${fmt}`);
      logToolUsage(SLUG, `download_${fmt}`);
    } catch (e: any) {
      logToolUsage(SLUG, `export_${fmt}_error`, undefined, e?.message);
      toast.error("Erro ao exportar.");
    }
  }

  async function exportSVG() {
    try {
      const payload = buildPayload();
      if (!payload) { toast.error("Gere o QR Code primeiro."); return; }
      const svg = await QRCode.toString(payload, {
        type: "svg", margin: 2,
        color: { dark: fgColor, light: bgTransparent ? "#00000000" : "#FFFFFF" },
        errorCorrectionLevel: "H",
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      triggerDownload(URL.createObjectURL(blob), "qrcode.svg");
      logToolUsage(SLUG, "download_svg", { bytes: blob.size });
    } catch (e: any) {
      logToolUsage(SLUG, "export_svg_error", undefined, e?.message);
    }
  }

  function exportPDF() {
    if (!canvasRef.current || !generated) { toast.error("Gere o QR Code primeiro."); return; }
    try {
      const canvas = canvasRef.current;
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const imgData = canvas.toDataURL("image/png");
      const sizeMm = 100;
      const pageW = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, "PNG", (pageW - sizeMm) / 2, 30, sizeMm, sizeMm);
      pdf.setFontSize(10);
      pdf.text("Gerado em adeconex.com/ferramentas/gerador-qrcode", pageW / 2, 140, { align: "center" });
      pdf.save("qrcode.pdf");
      logToolUsage(SLUG, "download_pdf");
    } catch (e: any) {
      logToolUsage(SLUG, "export_pdf_error", undefined, e?.message);
    }
  }

  function triggerDownload(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  }

  function formatBytes(b: number | null): string {
    if (!b) return "—";
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Quality estimator
  const quality: Quality = useMemo(() => {
    const finalSize = size === 0 ? customSize : size;
    const tips: string[] = [];
    let score = 100;
    const c1 = hexToRgb(fgColor);
    const c2 = bgTransparent ? { r: 255, g: 255, b: 255 } : { r: 255, g: 255, b: 255 };
    const contrast = contrastRatio(c1, c2);
    if (contrast < 4.5) { score -= 35; tips.push("Aumente o contraste entre a cor do QR e o fundo (mínimo 4.5:1)."); }
    if (finalSize < 300) { score -= 25; tips.push("Use tamanho mínimo de 300 px para garantir leitura em câmeras comuns."); }
    if (finalSize < 500 && logoDataUrl) { score -= 15; tips.push("Com logo central, gere a partir de 500 px para preservar a leitura."); }
    if (bgTransparent && fgColor.toLowerCase() === "#ffffff") { score -= 40; tips.push("QR branco sobre fundo transparente pode ficar invisível em superfícies claras."); }
    if (!logoDataUrl && contrast >= 7 && finalSize >= 500) tips.push("Configuração ideal: alta legibilidade em impressão e tela.");
    let level: Quality["level"] = "Excelente";
    let color = "text-emerald-600";
    let icon = CheckCircle2;
    if (score < 50) { level = "Ruim"; color = "text-red-600"; icon = AlertCircle; }
    else if (score < 70) { level = "Regular"; color = "text-amber-600"; icon = AlertCircle; }
    else if (score < 90) { level = "Boa"; color = "text-blue-600"; icon = Check; }
    return { level, color, icon, tips };
  }, [fgColor, bgTransparent, size, customSize, logoDataUrl]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Gerador de QR Code Adeconex",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "1248" },
  };

  const upcomingTools = [
    { name: "Gerador de Link WhatsApp", icon: "💬" },
    { name: "Gerador de Código de Barras", icon: "🔖" },
    { name: "Conversor ZPL para PDF", icon: "🖨️" },
    { name: "Calculadora de Margem Mercado Livre", icon: "📊" },
    { name: "Gerador Pix Copia e Cola", icon: "💸" },
  ];

  return (
    <Layout>
      <SEOHead
        title="Gerador de QR Code Gratuito com Logo"
        description="Crie QR Codes personalizados gratuitamente com logo, cores, tamanhos ajustáveis e exportação em PNG, JPG, SVG ou PDF. Ideal para etiquetas, embalagens, ecommerce e cartões."
        keywords="gerador qr code, criar qr code, qr code gratuito, qr code com logo, qr code personalizado, qr code png, qr code pdf, qr code svg, qr code para etiquetas, qr code para ecommerce, qr code whatsapp, qr code pix"
        canonical={CANONICAL}
        jsonLd={[appJsonLd, faqJsonLd]}
      />

      {/* HERO */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border">
        <div className="section-container py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="secondary" className="mb-4 font-heading"><Sparkles className="h-3 w-3 mr-1" /> 100% Gratuito · Sem cadastro</Badge>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Gerador de QR Code <span className="text-primary">Gratuito</span> com Logo
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
              Crie QR Codes personalizados para sites, WhatsApp, Pix, Wi-Fi, etiquetas, embalagens, cartões de visita e materiais impressos.
            </p>
            <ul className="grid grid-cols-2 gap-2 mt-6 max-w-md">
              {["QR Code com Logo","Download PNG","Download JPG","Download PDF","Download SVG","Uso Comercial Gratuito"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg" className="cta-gradient border-0 text-secondary-foreground font-heading font-bold">
                <a href="#ferramenta"><QrCode className="h-4 w-4 mr-2" /> Gerar meu QR Code</a>
              </Button>
            </div>
          </div>
          <div className="flex justify-center md:justify-end order-first md:order-last">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
              <canvas ref={heroCanvasRef} className="rounded-lg" />
              <p className="text-xs text-center text-muted-foreground mt-3 font-heading">Pré-visualização</p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-container py-10">
        {/* Anúncio entre Hero e Ferramenta */}
        <AdSlot position="top" pageType="ferramenta-qrcode" />

        {/* FERRAMENTA */}
        <section id="ferramenta" className="scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Configurações 40% */}
            <Card className="lg:col-span-2 p-6 shadow-md">
              <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" /> Configurações
              </h2>

              <div className="space-y-5">
                <div>
                  <Label className="font-heading text-sm">Tipo de conteúdo</Label>
                  <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)} className="mt-2">
                    <TabsList className="flex flex-wrap h-auto bg-muted/50">
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="texto">Texto</TabsTrigger>
                      <TabsTrigger value="telefone">Telefone</TabsTrigger>
                      <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                      <TabsTrigger value="email">E-mail</TabsTrigger>
                      <TabsTrigger value="pix">Pix</TabsTrigger>
                      <TabsTrigger value="wifi">Wi-Fi</TabsTrigger>
                    </TabsList>

                    <TabsContent value="url" className="mt-4">
                      <Label htmlFor="url">URL</Label>
                      <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                    </TabsContent>
                    <TabsContent value="texto" className="mt-4">
                      <Label htmlFor="texto">Texto</Label>
                      <Textarea id="texto" value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} />
                    </TabsContent>
                    <TabsContent value="telefone" className="mt-4">
                      <Label htmlFor="tel">Telefone</Label>
                      <Input id="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="+55 11 99999-0000" />
                    </TabsContent>
                    <TabsContent value="whatsapp" className="mt-4 space-y-3">
                      <div>
                        <Label htmlFor="wa">Número com DDI</Label>
                        <Input id="wa" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="5511999990000" />
                      </div>
                      <div>
                        <Label htmlFor="wamsg">Mensagem (opcional)</Label>
                        <Input id="wamsg" value={waMsg} onChange={(e) => setWaMsg(e.target.value)} />
                      </div>
                    </TabsContent>
                    <TabsContent value="email" className="mt-4 space-y-3">
                      <div>
                        <Label htmlFor="em">E-mail</Label>
                        <Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="ems">Assunto (opcional)</Label>
                        <Input id="ems" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                      </div>
                    </TabsContent>
                    <TabsContent value="pix" className="mt-4">
                      <Label htmlFor="pix">Pix Copia e Cola</Label>
                      <Textarea id="pix" value={pixCode} onChange={(e) => setPixCode(e.target.value)} rows={3} placeholder="00020126..." />
                    </TabsContent>
                    <TabsContent value="wifi" className="mt-4 space-y-3">
                      <div>
                        <Label htmlFor="ssid">Nome da rede (SSID)</Label>
                        <Input id="ssid" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="wpass">Senha</Label>
                        <Input id="wpass" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} />
                      </div>
                      <div>
                        <Label>Criptografia</Label>
                        <Select value={wifiAuth} onValueChange={(v) => setWifiAuth(v as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WPA">WPA/WPA2</SelectItem>
                            <SelectItem value="WEP">WEP</SelectItem>
                            <SelectItem value="nopass">Sem senha</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <Label className="font-heading text-sm">Cor</Label>
                  <RadioGroup value={colorPreset} onValueChange={setColorPreset} className="flex flex-wrap gap-3 mt-2">
                    {["preto", "azul", "vermelho", "verde", "personalizada"].map((c) => (
                      <label key={c} className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value={c} id={`c-${c}`} />
                        <span className="capitalize text-sm">{c}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  {colorPreset === "personalizada" && (
                    <Input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)} className="mt-2 h-10 w-20 p-1" />
                  )}
                </div>

                <div>
                  <Label className="font-heading text-sm">Fundo</Label>
                  <RadioGroup value={bgTransparent ? "transparente" : "branco"} onValueChange={(v) => setBgTransparent(v === "transparente")} className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="branco" id="bg-b" /> Branco</label>
                    <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="transparente" id="bg-t" /> Transparente</label>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="font-heading text-sm">Tamanho (px)</Label>
                  <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">300 x 300</SelectItem>
                      <SelectItem value="500">500 x 500</SelectItem>
                      <SelectItem value="1000">1000 x 1000</SelectItem>
                      <SelectItem value="2000">2000 x 2000</SelectItem>
                      <SelectItem value="0">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  {size === 0 && (
                    <Input type="number" min={100} max={4000} value={customSize} onChange={(e) => setCustomSize(Number(e.target.value))} className="mt-2" />
                  )}
                </div>

                <div>
                  <Label className="font-heading text-sm" htmlFor="logo">Logo central (opcional)</Label>
                  <Input id="logo" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="mt-2" />
                  {logoFile && <p className="text-xs text-muted-foreground mt-1">{logoFile.name}</p>}
                </div>

                <Button onClick={handleGenerate} disabled={generating} className="w-full cta-gradient border-0 text-secondary-foreground font-heading font-bold" size="lg">
                  {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
                  Gerar QR Code
                </Button>
              </div>
            </Card>

            {/* Preview 60% */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="p-6 md:p-8 shadow-xl bg-gradient-to-br from-muted/20 to-background">
                <div className="flex items-center justify-center rounded-xl bg-white border border-border p-6 md:p-10" style={{ minHeight: 380 }}>
                  <canvas ref={canvasRef} className="max-w-full h-auto rounded-md" style={{ background: bgTransparent ? "transparent" : "#fff" }} />
                  {!generated && (
                    <div className="text-center text-muted-foreground">
                      <QrCode className="h-16 w-16 mx-auto opacity-30 mb-3" />
                      <p>Sua pré-visualização aparecerá aqui</p>
                    </div>
                  )}
                </div>

                {/* Indicador de qualidade */}
                {generated && (
                  <div className="mt-6 p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold text-sm">Qualidade de Leitura</span>
                      <span className={`flex items-center gap-1 font-heading font-bold ${quality.color}`}>
                        <quality.icon className="h-4 w-4" /> {quality.level}
                      </span>
                    </div>
                    {quality.tips.length > 0 && (
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {quality.tips.map((t, i) => <li key={i}>• {t}</li>)}
                      </ul>
                    )}
                  </div>
                )}

                {/* Botões de download */}
                {generated && (
                  <div className="mt-6">
                    <h3 className="font-heading font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Baixar QR Code</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button variant="outline" onClick={exportPNG} className="flex-col h-auto py-3">
                        <FileImage className="h-5 w-5 mb-1 text-primary" />
                        <span className="font-heading font-bold">PNG</span>
                        <span className="text-[10px] text-muted-foreground">{formatBytes(pngBytes)}</span>
                      </Button>
                      <Button variant="outline" onClick={exportJPG} className="flex-col h-auto py-3">
                        <ImageIcon className="h-5 w-5 mb-1 text-primary" />
                        <span className="font-heading font-bold">JPG</span>
                        <span className="text-[10px] text-muted-foreground">alta resolução</span>
                      </Button>
                      <Button variant="outline" onClick={exportPDF} className="flex-col h-auto py-3">
                        <FileText className="h-5 w-5 mb-1 text-primary" />
                        <span className="font-heading font-bold">PDF</span>
                        <span className="text-[10px] text-muted-foreground">A4 imprimível</span>
                      </Button>
                      <Button variant="outline" onClick={exportSVG} className="flex-col h-auto py-3">
                        <FileCode2 className="h-5 w-5 mb-1 text-primary" />
                        <span className="font-heading font-bold">SVG</span>
                        <span className="text-[10px] text-muted-foreground">vetorial</span>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Exemplos de aplicação com mockups */}
              {generated && previewDataUrl && (
                <div>
                  <h3 className="font-heading text-lg font-bold mb-3">Exemplo de Aplicação</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Mockup label="Cartão de Visita" icon={CreditCard} qr={previewDataUrl} variant="card" />
                    <Mockup label="Etiqueta Adesiva" icon={Tag} qr={previewDataUrl} variant="label" />
                    <Mockup label="Embalagem" icon={Package} qr={previewDataUrl} variant="box" />
                    <Mockup label="Display de Mesa" icon={Monitor} qr={previewDataUrl} variant="display" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CONTEÚDO SEO */}
        <article className="prose prose-sm md:prose-base max-w-none mt-16 text-foreground">
          <h2 className="font-heading">Como criar um QR Code profissional</h2>
          <p>
            O <strong>QR Code</strong> (Quick Response Code) deixou de ser uma curiosidade tecnológica para se tornar uma ferramenta
            essencial na comunicação entre o mundo físico e o digital. Empresas, lojas virtuais, profissionais autônomos e
            indústrias utilizam QR Codes diariamente para conectar materiais impressos a páginas web, vídeos, formulários, pagamentos
            e redes sociais. Neste guia, você aprende a criar um QR Code profissional, gratuito e de alta qualidade — pronto para uso
            comercial em qualquer suporte.
          </p>

          <h3 className="font-heading">O que é um QR Code</h3>
          <p>
            O QR Code é um código bidimensional que armazena informações digitais legíveis pela câmera de qualquer smartphone
            moderno. Diferente do código de barras tradicional, que armazena apenas números, o QR Code aceita textos, URLs,
            instruções de pagamento Pix, credenciais de Wi-Fi, contatos vCard e muito mais. Em poucos segundos o usuário acessa
            o conteúdo sem precisar digitar absolutamente nada — uma vantagem decisiva em campanhas que dependem de conversão rápida.
          </p>

          <h3 className="font-heading">Como funciona</h3>
          <p>
            Internamente, o QR Code organiza a informação em uma matriz de quadrados pretos e brancos. Três marcadores nos cantos
            permitem que a câmera identifique a orientação correta, enquanto algoritmos de <strong>correção de erros Reed-Solomon</strong>
            garantem leitura mesmo quando parte do código sofre danos físicos (riscos, dobras, sujeira). É por isso que utilizamos
            sempre o nível H de correção (até 30% de tolerância) — fundamental quando se aplica um logotipo central.
          </p>

          <h3 className="font-heading">Como usar QR Code em ecommerce</h3>
          <p>
            Lojas virtuais ganham conversão e percepção de marca ao adicionar QR Codes em pontos estratégicos da jornada de compra.
            Insira o QR Code do produto na embalagem, dentro do pacote ou no flyer promocional para enviar o cliente direto para a
            página de avaliações, programa de fidelidade ou WhatsApp de atendimento. Esse tipo de ação aumenta o ticket médio,
            estimula a recompra e gera prova social orgânica.
          </p>

          <h3 className="font-heading">QR Code no Mercado Livre</h3>
          <p>
            Vendedores do <strong>Mercado Livre</strong> que aplicam QR Codes em encartes de unboxing oferecem uma experiência diferenciada.
            O QR pode levar a vídeos de instalação, manuais ilustrados, cupons exclusivos para a próxima compra ou ao próprio link
            do anúncio para incentivar avaliação positiva. Como a plataforma valoriza reputação, esse pequeno detalhe impacta
            diretamente as métricas de qualidade do vendedor.
          </p>

          <h3 className="font-heading">QR Code na Shopee</h3>
          <p>
            Na <strong>Shopee</strong>, a competição por atenção é altíssima. Incluir QR Codes em flyers e embalagens reforça a marca
            e cria pontos de contato fora do app. Vendedores experientes usam QR Codes para divulgar grupos de WhatsApp, listas
            VIP de novidades e códigos de desconto recorrentes — táticas que reduzem a dependência exclusiva da plataforma.
          </p>

          <h3 className="font-heading">QR Code em etiquetas adesivas</h3>
          <p>
            Etiquetas térmicas e adesivas impressas em equipamentos profissionais como <strong>Zebra ZD220, Argox OS-214, Elgin L42 Pro</strong>
            e Honeywell suportam perfeitamente QR Codes de até 1,5 cm². Em logística, esse código pode representar lote, validade,
            número de série, código do pedido ou link para rastreamento. A combinação de <strong>ribbon de cera-resina</strong> com etiquetas
            couché ou BOPP garante durabilidade mesmo em ambientes úmidos ou expostos ao atrito.
          </p>

          <h3 className="font-heading">QR Code em embalagens</h3>
          <p>
            Embalagens com QR Code ampliam a experiência sem poluir o design. Marcas premium usam o código para apresentar vídeos
            institucionais, ingredientes detalhados, certificados de origem, programas de fidelidade e instruções de descarte. Em
            embalagens de alimentos, eletrônicos e cosméticos, o QR Code substitui longos manuais e reduz custo gráfico ao mesmo
            tempo em que aumenta o engajamento.
          </p>

          <h3 className="font-heading">QR Code em cartões de visita</h3>
          <p>
            Imprima um QR Code no verso do cartão para que o contato seja salvo automaticamente, com link para LinkedIn, portfólio
            ou catálogo digital. Profissionais liberais e corretores aumentam significativamente a taxa de retorno ao oferecer um
            atalho de contato que dispensa digitação manual.
          </p>

          <h3 className="font-heading">QR Code em catálogos e vitrines</h3>
          <p>
            Em vitrines físicas, um QR Code adesivado permite que o cliente consulte estoque, preço e variações sem entrar na loja —
            ideal para horários fora de expediente. Em catálogos impressos, cada produto pode ter seu QR individual levando direto
            para a página de compra, encurtando a jornada e elevando o ROI da peça impressa.
          </p>

          <h3 className="font-heading">Boas práticas</h3>
          <ul>
            <li>Mantenha contraste alto — preferencialmente preto sobre branco, ou cor escura sobre fundo claro.</li>
            <li>Reserve uma margem branca (quiet zone) de pelo menos 4 módulos ao redor do código.</li>
            <li>Para impressão, use no mínimo 2 cm × 2 cm. Para embalagens grandes, 4 cm é o ideal.</li>
            <li>Use SVG sempre que possível em peças gráficas — escala infinita sem perda.</li>
            <li>Teste o código com pelo menos três aparelhos diferentes antes de mandar imprimir milhares de unidades.</li>
          </ul>

          <h3 className="font-heading">Cuidados de impressão</h3>
          <p>
            Em impressão térmica, ajuste a temperatura para evitar borrões; em offset, valide a prova final em papel definitivo;
            em flexografia, escolha clichês com boa resolução. Verifique também o tipo de superfície: embalagens metalizadas ou
            holográficas reduzem o contraste e podem prejudicar a leitura — nesses casos, aplique uma área branca de respiro
            atrás do QR Code.
          </p>
        </article>

        {/* Bloco Adeconex específico */}
        <section className="mt-12 p-6 md:p-10 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Tag className="h-7 w-7 text-primary" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground m-0">QR Code para Etiquetas e Embalagens</h2>
          </div>
          <p className="text-muted-foreground max-w-3xl">
            A Adeconex é especialista em soluções de impressão térmica para indústria, varejo e logística. Confira como o QR Code
            potencializa cada aplicação:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            {[
              { t: "Etiquetas adesivas", d: "QR Codes em etiquetas couché, BOPP ou térmicas para rastreabilidade de produtos, validade e identificação de lote." },
              { t: "Ribbons", d: "Combine ribbon cera-resina com QR Code em alta densidade para máxima durabilidade contra atrito e exposição." },
              { t: "Embalagens", d: "QR Code impresso direto na caixa para abrir manuais digitais, vídeos institucionais e canais de pós-venda." },
              { t: "Logística", d: "Rastreamento ponto a ponto com QR único por volume, integrado a sistemas WMS e TMS." },
              { t: "Rastreamento", d: "Conformidade com normas de farmácia, alimentos e eletrônicos, garantindo origem auditável." },
              { t: "Identificação de produtos", d: "Substitua manuais impressos por QR direcionando para FAQ, vídeo e atendimento." },
            ].map((b) => (
              <div key={b.t} className="p-4 bg-card border border-border rounded-lg">
                <h3 className="font-heading font-bold text-foreground">{b.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{b.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button asChild className="cta-gradient border-0 text-secondary-foreground font-heading font-bold">
              <a href="https://www.adeconex.com.br" target="_blank" rel="noopener noreferrer">Conhecer soluções Adeconex</a>
            </Button>
          </div>
        </section>

        {/* Anúncio após conteúdo SEO */}
        <AdSlot position="mid" pageType="ferramenta-qrcode" />

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="bg-card border border-border rounded-xl overflow-hidden">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="px-4">
                <AccordionTrigger className="font-heading text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Outras ferramentas (em breve) */}
        <section className="mt-16">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">Outras Ferramentas Gratuitas</h2>
          <p className="text-muted-foreground mb-6">Em desenvolvimento — em breve disponíveis na Adeconex.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {upcomingTools.map((t) => (
              <div key={t.name} className="relative p-5 rounded-xl border border-border bg-card/60 opacity-70 hover:opacity-90 transition-opacity">
                <div className="text-3xl mb-2">{t.icon}</div>
                <h3 className="font-heading font-bold text-sm leading-tight">{t.name}</h3>
                <Badge variant="secondary" className="mt-3 text-[10px]"><Lock className="h-3 w-3 mr-1" /> Em breve</Badge>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link to="/ferramentas">Ver todas as ferramentas</Link>
            </Button>
          </div>
        </section>

        {/* Multiplex no rodapé */}
        <MultiplexAd pageType="ferramenta-qrcode" />
      </div>
    </Layout>
  );
}

// ---------- helpers ----------
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrastRatio(c1: any, c2: any) {
  const l1 = luminance(c1), l2 = luminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ---------- mockup component ----------
function Mockup({ label, icon: Icon, qr, variant }: { label: string; icon: any; qr: string; variant: "card" | "label" | "box" | "display" }) {
  const styles: Record<string, string> = {
    card: "bg-gradient-to-br from-slate-700 to-slate-900",
    label: "bg-yellow-50 border-dashed",
    box: "bg-amber-100",
    display: "bg-gradient-to-b from-zinc-200 to-zinc-400",
  };
  return (
    <div className="flex flex-col items-center">
      <div className={`relative w-full aspect-square rounded-lg border border-border overflow-hidden flex items-center justify-center p-4 ${styles[variant]}`}>
        <img src={qr} alt={`Aplicação em ${label}`} className="w-2/3 h-2/3 object-contain bg-white p-1 rounded shadow-md" />
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
    </div>
  );
}
