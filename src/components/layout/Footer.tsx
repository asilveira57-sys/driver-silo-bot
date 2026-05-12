import { Link } from "react-router-dom";
import { Printer, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="hero-gradient text-primary-foreground">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Printer className="h-6 w-6" />
              <span className="font-heading text-xl font-bold">ADECONEX</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Hub técnico de impressoras térmicas, etiquetas e ribbons.
              Drivers, softwares e tutoriais completos.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/impressoras" className="hover:text-secondary transition-colors">Impressoras</Link></li>
              <li><Link to="/drivers" className="hover:text-secondary transition-colors">Drivers</Link></li>
              <li><Link to="/softwares" className="hover:text-secondary transition-colors">Softwares</Link></li>
              <li><Link to="/tutoriais" className="hover:text-secondary transition-colors">Tutoriais</Link></li>
              <li><Link to="/materiais" className="hover:text-secondary transition-colors">Materiais</Link></li>
              <li><Link to="/downloads" className="hover:text-secondary transition-colors">Central de Downloads</Link></li>
              <li><Link to="/quem-somos" className="hover:text-secondary transition-colors">Quem Somos</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Produtos</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="https://www.adeconex.com.br" target="_blank" rel="noopener" className="hover:text-secondary transition-colors">Etiquetas Adesivas</a></li>
              <li><a href="https://www.adeconex.com.br" target="_blank" rel="noopener" className="hover:text-secondary transition-colors">Ribbons</a></li>
              <li><a href="https://www.adeconex.com.br" target="_blank" rel="noopener" className="hover:text-secondary transition-colors">Fita de Cetim</a></li>
              <li><a href="https://www.adeconex.com.br" target="_blank" rel="noopener" className="hover:text-secondary transition-colors">Impressoras</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span>27 33186565</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span>vendas@adeconex.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                <span>Vila Velha - ES, Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Adeconex. Todos os direitos reservados.</p>
          <a
            href="https://www.adeconex.com.br"
            target="_blank"
            rel="noopener"
            className="hover:text-secondary transition-colors font-medium"
          >
            Visite nossa loja →
          </a>
        </div>
      </div>
    </footer>
  );
}
