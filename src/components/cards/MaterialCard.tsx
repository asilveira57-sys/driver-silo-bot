import { Link } from "react-router-dom";
import { Tag, ChevronRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Material = Database["public"]["Tables"]["materials"]["Row"];

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const slug = material.slug || material.id;

  return (
    <Link to={`/materiais/${slug}`} className="silo-card group flex flex-col gap-3">
      {material.imagem_url ? (
        <img
          src={material.imagem_url}
          alt={material.nome}
          className="w-full h-40 object-contain rounded-md bg-muted"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 flex items-center justify-center rounded-md bg-muted">
          <Tag className="h-12 w-12 text-muted-foreground/40" />
        </div>
      )}
      <div>
        <span className="text-xs font-medium text-primary uppercase tracking-wide">
          {material.categoria}
        </span>
        <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
          {material.nome}
        </h3>
        {material.descricao && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{material.descricao}</p>
        )}
      </div>
      <div className="mt-auto flex items-center text-sm text-primary font-medium">
        Ver detalhes <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
