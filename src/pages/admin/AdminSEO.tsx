import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Download, ExternalLink, RefreshCw, Sparkles } from "lucide-react";

const SITEMAP_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/sitemap`;
const ROBOTS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/robots`;

type Settings = {
  id?: string;
  site_url: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image_url: string | null;
  ga_id: string | null;
  robots_txt: string;
};

const empty: Settings = {
  site_url: "https://www.adeconex.com",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_image_url: "",
  ga_id: "",
  robots_txt: "User-agent: *\nAllow: /\n\nSitemap: https://www.adeconex.com/sitemap.xml\n",
};

export default function AdminSEO() {
  const [form, setForm] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sitemapXml, setSitemapXml] = useState("");
  const [sitemapLoading, setSitemapLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*").eq("singleton", true).maybeSingle();
    if (error) toast.error(error.message);
    if (data) setForm({ ...empty, ...data });
    setLoading(false);
  };

  const fetchSitemap = async () => {
    setSitemapLoading(true);
    try {
      const res = await fetch(SITEMAP_URL);
      setSitemapXml(await res.text());
    } catch (e: any) {
      toast.error("Erro ao carregar sitemap");
    } finally {
      setSitemapLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetchSitemap();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        site_url: form.site_url,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        meta_keywords: form.meta_keywords,
        og_image_url: form.og_image_url,
        ga_id: form.ga_id,
        robots_txt: form.robots_txt,
      })
      .eq("singleton", true);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas!");
  };

  const generateGlobalSEO = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-seo", {
        body: {
          titulo: "Adeconex - Impressoras Térmicas, Drivers, Softwares e Etiquetas",
          conteudo:
            "Hub técnico Adeconex com drivers oficiais, softwares, tutoriais e materiais para impressoras térmicas Zebra, Argox, Elgin, Bematech, Honeywell, TSC e Datamax. Soluções para etiquetas, ribbons e códigos de barras.",
          contexto: "Página inicial / SEO global do site",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForm((p) => ({
        ...p,
        meta_title: data.meta_title || p.meta_title,
        meta_description: data.meta_description || p.meta_description,
        meta_keywords: data.meta_keywords || p.meta_keywords,
      }));
      toast.success("SEO global gerado com IA!");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao gerar");
    } finally {
      setGenerating(false);
    }
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapXml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Configurações de SEO</h1>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="ml-2">Salvar tudo</span>
        </Button>
      </div>

      <Tabs defaultValue="meta">
        <TabsList>
          <TabsTrigger value="meta">Meta tags globais</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="robots">robots.txt</TabsTrigger>
          <TabsTrigger value="sitemap">sitemap.xml</TabsTrigger>
        </TabsList>

        <TabsContent value="meta" className="space-y-4 bg-background border border-border rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Usado como fallback quando uma página não define seus próprios.</p>
            <Button type="button" size="sm" variant="secondary" onClick={generateGlobalSEO} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="ml-1.5">Gerar com IA</span>
            </Button>
          </div>
          <div>
            <Label>Meta Title <span className="text-xs text-muted-foreground">({(form.meta_title || "").length}/60)</span></Label>
            <Input value={form.meta_title || ""} maxLength={70} onChange={(e) => setForm((p) => ({ ...p, meta_title: e.target.value }))} />
          </div>
          <div>
            <Label>Meta Description <span className="text-xs text-muted-foreground">({(form.meta_description || "").length}/160)</span></Label>
            <Textarea rows={3} value={form.meta_description || ""} maxLength={170} onChange={(e) => setForm((p) => ({ ...p, meta_description: e.target.value }))} />
          </div>
          <div>
            <Label>Meta Keywords <span className="text-xs text-muted-foreground">(separar por vírgula)</span></Label>
            <Input value={form.meta_keywords || ""} onChange={(e) => setForm((p) => ({ ...p, meta_keywords: e.target.value }))} />
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-4 bg-background border border-border rounded-lg p-4 mt-4">
          <div>
            <Label>Site URL (canônica)</Label>
            <Input value={form.site_url} onChange={(e) => setForm((p) => ({ ...p, site_url: e.target.value }))} placeholder="https://www.adeconex.com" />
          </div>
          <div>
            <Label>Google Analytics ID</Label>
            <Input value={form.ga_id || ""} onChange={(e) => setForm((p) => ({ ...p, ga_id: e.target.value }))} placeholder="G-XXXXXXXXXX" />
            <p className="text-xs text-muted-foreground mt-1">Atualmente fixo no index.html: G-N42WXH8B80.</p>
          </div>
          <div>
            <Label>Open Graph Image padrão (URL)</Label>
            <Input value={form.og_image_url || ""} onChange={(e) => setForm((p) => ({ ...p, og_image_url: e.target.value }))} placeholder="https://..." />
          </div>
        </TabsContent>

        <TabsContent value="robots" className="space-y-3 bg-background border border-border rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Servido em <code className="text-xs">/robots.txt</code> via edge function.</p>
            <Button asChild size="sm" variant="outline">
              <a href={ROBOTS_URL} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Abrir</a>
            </Button>
          </div>
          <Textarea rows={14} className="font-mono text-xs" value={form.robots_txt} onChange={(e) => setForm((p) => ({ ...p, robots_txt: e.target.value }))} />
        </TabsContent>

        <TabsContent value="sitemap" className="space-y-3 bg-background border border-border rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Gerado automaticamente a partir do banco.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={fetchSitemap} disabled={sitemapLoading}>
                {sitemapLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-1.5">Atualizar</span>
              </Button>
              <Button size="sm" variant="outline" onClick={downloadSitemap} disabled={!sitemapXml}>
                <Download className="h-4 w-4" /><span className="ml-1.5">Baixar</span>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href={SITEMAP_URL} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Abrir</a>
              </Button>
            </div>
          </div>
          <Textarea rows={20} className="font-mono text-xs" value={sitemapXml} readOnly />
        </TabsContent>
      </Tabs>
    </div>
  );
}
