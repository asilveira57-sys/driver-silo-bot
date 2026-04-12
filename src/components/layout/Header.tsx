import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, Printer, Download, BookOpen, Package, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAdeconex from "@/assets/logo-adeconex.png";

const navItems = [
  { label: "Impressoras", path: "/impressoras", icon: Printer },
  { label: "Drivers", path: "/drivers", icon: Cpu },
  { label: "Softwares", path: "/softwares", icon: Download },
  { label: "Tutoriais", path: "/tutoriais", icon: BookOpen },
  { label: "Materiais", path: "/materiais", icon: Package },
  { label: "Downloads", path: "/downloads", icon: Download },
  { label: "Blog", path: "/blog", icon: BookOpen },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="section-container">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logoAdeconex} alt="Adeconex Etiquetas" className="h-14" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://www.adeconex.com.br"
              target="_blank"
              rel="noopener"
              className="hidden sm:inline-flex"
            >
              <Button variant="default" size="sm" className="cta-gradient border-0 text-secondary-foreground font-heading font-bold">
                Loja Online
              </Button>
            </a>
            <button
              className="lg:hidden p-2 text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="section-container py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <a
              href="https://www.adeconex.com.br"
              target="_blank"
              rel="noopener"
              className="mt-2"
            >
              <Button className="w-full cta-gradient border-0 text-secondary-foreground font-heading font-bold">
                Loja Online
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
