import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";

interface SEOFieldsProps {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  onChange: (field: "meta_title" | "meta_description" | "meta_keywords", value: string) => void;
}

export function SEOFields({ metaTitle, metaDescription, metaKeywords, onChange }: SEOFieldsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="sm:col-span-2 border border-border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Search className="h-4 w-4 text-primary" />
          Configurações SEO
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
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
