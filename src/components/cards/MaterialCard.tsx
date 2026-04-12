import { ExternalLink, Tag } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Material = Database["public"]["Tables"]["materials"]["Row"];

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  return (
    <div className="silo-card flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {material.categoria}
        </span>
      </div>
      <h3 className="font-heading font-bold text-foreground">{material.nome}</h3>
      {material.descricao && (
        <p className="text-sm text-muted-foreground">{material.descricao}</p>
      )}
      {material.link_produto && (
        <a
          href={material.link_produto}
          target="_blank"
          rel="noopener"
          className="download-btn text-sm mt-auto self-start"
        >
          <ExternalLink className="h-4 w-4" />
          Comprar Produto
        </a>
      )}
    </div>
  );
}
