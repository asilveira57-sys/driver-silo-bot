import { Link } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Tutorial = Database["public"]["Tables"]["tutorials"]["Row"];

interface TutorialCardProps {
  tutorial: Tutorial;
}

export function TutorialCard({ tutorial }: TutorialCardProps) {
  return (
    <Link to={`/tutoriais/${tutorial.slug}`} className="silo-card group flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-md bg-primary/10">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {tutorial.categoria}
        </span>
      </div>
      <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
        {tutorial.titulo}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-3">
        {tutorial.conteudo.substring(0, 150)}...
      </p>
      <div className="mt-auto flex items-center text-sm text-primary font-medium">
        Ler tutorial <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
