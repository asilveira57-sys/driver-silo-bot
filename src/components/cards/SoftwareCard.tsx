import { Download, Package } from "lucide-react";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Software = Database["public"]["Tables"]["softwares"]["Row"];

interface SoftwareCardProps {
  software: Software;
}

export function SoftwareCard({ software }: SoftwareCardProps) {
  const slug = software.nome.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="silo-card flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-secondary/20">
          <Package className="h-5 w-5 text-secondary-foreground" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-foreground">{software.nome}</h3>
          <span className="text-xs text-muted-foreground">v{software.versao}</span>
        </div>
      </div>
      {software.descricao && (
        <p className="text-sm text-muted-foreground line-clamp-2">{software.descricao}</p>
      )}
      <div className="flex items-center gap-3 mt-auto pt-3">
        <Link
          to={`/softwares/${slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver detalhes
        </Link>
        <a
          href={software.link_download}
          className="download-btn text-sm ml-auto"
          target="_blank"
          rel="noopener"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>
    </div>
  );
}
