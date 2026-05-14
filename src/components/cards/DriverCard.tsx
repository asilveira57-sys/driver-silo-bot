import { Link } from "react-router-dom";
import { Download, Monitor, Calendar } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Driver = Database["public"]["Tables"]["drivers"]["Row"];

interface DriverCardProps {
  driver: Driver;
}

export function DriverCard({ driver }: DriverCardProps) {
  return (
    <div className="silo-card flex flex-col gap-3">
      {driver.imagem_url ? (
        <img
          src={driver.imagem_url}
          alt={`${driver.marca} ${driver.modelo}`}
          className="w-full h-40 object-contain rounded-md bg-muted"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 flex items-center justify-center rounded-md bg-muted">
          <Monitor className="h-12 w-12 text-muted-foreground/40" />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading font-bold text-foreground">
            {driver.nome}
          </h3>
          <p className="text-sm text-muted-foreground">
            {driver.marca} — {driver.modelo}
          </p>
        </div>
        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
          v{driver.versao}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Monitor className="h-3 w-3" />
          {driver.sistema_operacional}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(driver.data_publicacao).toLocaleDateString("pt-BR")}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-3">
        <Link
          to={`/drivers/${driver.modelo.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver detalhes
        </Link>
        <a
          href={driver.link_download}
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
