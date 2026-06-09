import { useEffect, useRef, useState } from "react";
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
import { Download, QrCode, Loader2 } from "lucide-react";
import { logToolUsage } from "@/lib/toolLogs";
import { toast } from "sonner";

const SLUG = "gerador-qrcode";

type ContentType = "url" | "texto" | "telefone" | "whatsapp" | "email" | "pix" | "wifi";

const PRESET_COLORS: Record<string, string> = {
  preto: "#000000",
  azul: "#1a6fc4",
  vermelho: "#C41E3A",
  verde: "#10b981",
};

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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fgColor = colorPreset === "personalizada" ? customColor : PRESET_COLORS[colorPreset];

  useEffect(() => {
    logToolUsage(SLUG, "access");
  }, []);

  useEffect(() => {
    if (!logoFile) { setLogoDataUrl(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => setLogoDataUrl(e.target?.result as string);
    reader.readAsDataURL(logoFile);
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
    if (!payload) { toast.error("Preencha o conteúdo do QR Code."); return; }
    const finalSize = size === 0 ? customSize : size;
    setGenerating(true);
    try {
      const canvas = canvasRef.current!;
      await QRCode.toCanvas(canvas, payload, {
        width: finalSize,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgTransparent ? "#00000000" : "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      });
      if (logoDataUrl) {
        await drawLogo(canvas, logoDataUrl, finalSize);
      }
      setGenerated(true);
      logToolUsage(SLUG, "generate", { contentType, size: finalSize, hasLogo: !!logoDataUrl });
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
        // White rounded background for legibility
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
      // For JPG flatten transparency to white
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
      logToolUsage(SLUG, `export_${fmt}`);
    } catch (e: any) {
      logToolUsage(SLUG, `export_${fmt}_error`, undefined, e?.message);
    }
  }

  async function exportSVG() {
    try {
      const payload = buildPayload();
      const svg = await QRCode.toString(payload, {
        type: "svg",
        margin: 2,
        color: { dark: fgColor, light: bgTransparent ? "#00000000" : "#FFFFFF" },
        errorCorrectionLevel: "H",
      });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      triggerDownload(URL.createObjectURL(blob), "qrcode.svg");
      logToolUsage(SLUG, "export_svg");
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
      logToolUsage(SLUG, "export_pdf");
    } catch (e: any) {
      logToolUsage(SLUG, "export_pdf_error", undefined, e?.message);
    }
  }

  function triggerDownload(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  }

  const canonical = "https://www.adeconex.com/ferramentas/gerador-qrcode";

  return (
    <Layout>
      <SEOHead
        title="Gerador de QR Code Gratuito com Logo"
        description="Crie QR Codes personalizados gratuitamente. Adicione logotipo, altere tamanho, exporte em PNG, JPG ou PDF e utilize em produtos, cartões, etiquetas e materiais gráficos."
        keywords="gerador qr code, criar qr code, qr code personalizado, qr code com logo, gerador qr code online, qr code png, qr code pdf, qr code para empresas"
        canonical={canonical}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Gerador de QR Code Adeconex",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        }}
      />

      <div className="section-container py-10">
        <header className="mb-6">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <QrCode className="h-8 w-8 text-primary" /> Gerador de QR Code Gratuito
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            Crie QR Codes personalizados, com cores, fundo transparente e logotipo central. Exporte em PNG, JPG, PDF ou SVG em alta resolução.
          </p>
        </header>

        <article className="prose prose-sm md:prose-base max-w-none mb-8 text-foreground">
          <h2 className="font-heading">O que é um QR Code e por que usar?</h2>
          <p>
            O <strong>QR Code</strong> (Quick Response Code) é um código bidimensional que armazena informações
            digitais legíveis pela câmera de qualquer smartphone. Em poucos segundos o usuário acessa um link,
            envia uma mensagem, conecta-se a uma rede Wi-Fi ou efetua um pagamento via Pix — tudo sem digitar nada.
          </p>
          <h2 className="font-heading">Como utilizar este gerador</h2>
          <p>
            Escolha o tipo de conteúdo (URL, texto, telefone, WhatsApp, e-mail, Pix copia e cola ou Wi-Fi),
            personalize cores, tamanho e adicione um logo central se desejar. Em seguida, clique em
            <strong> Gerar QR Code</strong> e baixe nos formatos PNG, JPG, PDF ou SVG.
          </p>
          <h2 className="font-heading">Aplicações em ecommerce</h2>
          <p>
            Em lojas virtuais, QR Codes encurtam a jornada de compra: leve clientes do flyer físico direto ao produto,
            ofereça cupons exclusivos, vincule reviews ou redirecione para o WhatsApp de atendimento. Marketplaces como
            <strong> Mercado Livre, Shopee e Amazon</strong> também aceitam materiais impressos com QR Code para encantar o cliente no unboxing.
          </p>
          <h2 className="font-heading">Aplicações em etiquetas</h2>
          <p>
            Em etiquetas adesivas e tags, o QR Code substitui longos manuais e ainda funciona como rastreabilidade
            de lotes, validade e procedência. Combine com impressoras térmicas como <strong>Zebra, Argox, Elgin e Honeywell</strong>
            para imprimir milhares de unidades com qualidade industrial.
          </p>
          <h2 className="font-heading">Aplicações em embalagens</h2>
          <p>
            Marcas usam QR Codes em embalagens para apresentar vídeos institucionais, instruções de uso,
            certificados de sustentabilidade e programas de fidelidade. É uma forma elegante de ampliar a experiência
            do cliente sem poluir o design da caixa.
          </p>
          <h2 className="font-heading">Aplicações em cartões de visita</h2>
          <p>
            Imprima um QR Code no verso do seu cartão para que o contato seja salvo automaticamente, leve para o LinkedIn,
            site institucional ou catálogo digital. Reduz custos com reimpressão e moderniza a marca pessoal.
          </p>
          <p>
            Todos os QR Codes gerados aqui possuem <strong>alto nível de correção de erros</strong>, garantindo leitura
            mesmo quando aplicados sobre superfícies curvas, com brilho ou após pequenos danos de impressão. Use à vontade
            em campanhas comerciais, materiais gráficos, embalagens e operações logísticas.
          </p>
        </article>

        <AdSlot position="top" pageType="ferramenta-qrcode" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controles */}
          <div className="space-y-6">
            <div>
              <Label className="font-heading">Tipo de conteúdo</Label>
              <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)} className="mt-2">
                <TabsList className="flex flex-wrap h-auto">
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
              <Label className="font-heading">Cor</Label>
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
              <Label className="font-heading">Fundo</Label>
              <RadioGroup value={bgTransparent ? "transparente" : "branco"} onValueChange={(v) => setBgTransparent(v === "transparente")} className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="branco" id="bg-b" /> Branco</label>
                <label className="flex items-center gap-2 cursor-pointer"><RadioGroupItem value="transparente" id="bg-t" /> Transparente</label>
              </RadioGroup>
            </div>

            <div>
              <Label className="font-heading">Tamanho (px)</Label>
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
              <Label className="font-heading" htmlFor="logo">Logo central (opcional)</Label>
              <Input id="logo" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="mt-2" />
              {logoFile && <p className="text-xs text-muted-foreground mt-1">{logoFile.name}</p>}
            </div>

            <Button onClick={handleGenerate} disabled={generating} className="w-full cta-gradient border-0 text-secondary-foreground font-heading font-bold" size="lg">
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <QrCode className="h-4 w-4 mr-2" />}
              Gerar QR Code
            </Button>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center">
            <div className="bg-muted/30 border border-border rounded-lg p-6 w-full flex items-center justify-center" style={{ minHeight: 360 }}>
              <canvas ref={canvasRef} className="max-w-full h-auto" style={{ background: bgTransparent ? "transparent" : "#fff" }} />
              {!generated && <span className="text-muted-foreground">Pré-visualização aparecerá aqui</span>}
            </div>
            {generated && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 w-full">
                <Button variant="outline" onClick={exportPNG}><Download className="h-4 w-4 mr-1" /> PNG</Button>
                <Button variant="outline" onClick={exportJPG}><Download className="h-4 w-4 mr-1" /> JPG</Button>
                <Button variant="outline" onClick={exportPDF}><Download className="h-4 w-4 mr-1" /> PDF</Button>
                <Button variant="outline" onClick={exportSVG}><Download className="h-4 w-4 mr-1" /> SVG</Button>
              </div>
            )}
          </div>
        </div>

        <AdSlot position="bottom" pageType="ferramenta-qrcode" />
        <MultiplexAd pageType="ferramenta-qrcode" />
      </div>
    </Layout>
  );
}
