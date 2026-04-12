import { Link } from "react-router-dom";
import { ChevronRight, Download, BookOpen, Printer } from "lucide-react";

interface SidebarLink {
  label: string;
  href: string;
  type?: "driver" | "tutorial" | "printer";
}

interface RelatedSidebarProps {
  title?: string;
  links: SidebarLink[];
}

const iconMap = {
  driver: Download,
  tutorial: BookOpen,
  printer: Printer,
};

export function RelatedSidebar({ title = "Relacionados", links }: RelatedSidebarProps) {
  return (
    <aside className="silo-card">
      <h3 className="font-heading font-bold text-foreground mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => {
          const Icon = iconMap[link.type || "driver"];
          return (
            <li key={link.href}>
              <Link
                to={link.href}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{link.label}</span>
                <ChevronRight className="h-3 w-3 shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
