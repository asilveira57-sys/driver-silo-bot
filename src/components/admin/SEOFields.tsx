import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SEOField = "meta_title" | "meta_description" | "meta_keywords";

interface SEOFieldsProps {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  onChange: (field: SEOField, value: string) => void;
  // Para geração automática:
  titulo?: string;
  conteudo?: string;
  contexto?: string;
}

export function SEOFields({ metaTitle, metaDescription, metaKeywords, onChange, titulo, conteudo, contexto }: SEOFieldsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!titulo?.trim() && !conteudo?.trim()) {
      toast.error("Preencha título ou conteúdo antes de gerar.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-seo", {
        body: { titulo, conteudo, contexto },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.meta_title) onChange("meta_title", data.meta_title);
      if (data?.meta_description) onChange("meta_description", data.meta_description);
      if (data?.meta_keywords) onChange("meta_keywords", data.meta_keywords);
      setOpen(true);
      toast.success("SEO gerado com IA!");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao gerar SEO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="sm:col-span-2 border border-border rounded-lg">
      <div className="flex items-center justify-between gap-2 p-3">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground flex-1 hover:bg-muted/50 -m-2 p-2 rounded">
          <Search className="h-4 w-4 text-primary" />
          Configurações SEO
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ml-auto ${open ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <Button type="button" size="sm" variant="secondary" onClick={generate} disabled={loading} className="shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span className="ml-1.5 hidden sm:inline">{loading ? "Gerando..." : "Gerar com IA"}</span>
        </Button>
      </div>
      <CollapsibleContent className="px-3 pb-3 space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Meta Title <span className="text-muted-foreground/60">({metaTitle.length}/60)</span></Label>
          <Input value={metaTitle} onChange={(e) => onChange("meta_title", e.target.value)} placeholder="Título para SEO (máx 60 caracteres)" maxLength={70} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Meta Description <span className="text-muted-foreground/60">({metaDescription.length}/160)</span></Label>
          <Textarea value={metaDescription} onChange={(e) => onChange("meta_description", e.target.value)} placeholder="Descrição para SEO (máx 160 caracteres)" rows={2} maxLength={170} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Meta Keywords <span className="text-muted-foreground/60">(separar por vírgula)</span></Label>
          <Input value={metaKeywords} onChange={(e) => onChange("meta_keywords", e.target.value)} placeholder="impressora térmica, etiqueta, driver, zebra" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
