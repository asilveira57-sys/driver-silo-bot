import { Link } from "react-router-dom";
import { Printer, ChevronRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PrinterType = Database["public"]["Tables"]["printers"]["Row"];

interface PrinterCardProps {
  printer: PrinterType;
}

export function PrinterCard({ printer }: PrinterCardProps) {
  const slug = `${printer.marca}/${printer.modelo}`.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link to={`/impressoras/${slug}`} className="silo-card group flex flex-col gap-3">
      {printer.imagem_url ? (
        <img
          src={printer.imagem_url}
          alt={`${printer.marca} ${printer.modelo}`}
          className="w-full h-40 object-contain rounded-md bg-muted"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 flex items-center justify-center rounded-md bg-muted">
          <Printer className="h-12 w-12 text-muted-foreground/40" />
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-primary uppercase tracking-wide">{printer.marca}</p>
        <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
          {printer.modelo}
        </h3>
        {printer.descricao && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{printer.descricao}</p>
        )}
      </div>
      <div className="mt-auto flex items-center text-sm text-primary font-medium">
        Ver detalhes <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
