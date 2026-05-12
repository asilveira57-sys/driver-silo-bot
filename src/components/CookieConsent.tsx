import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "adeconex.cookie-consent.v1";

type Prefs = {
  essential: true;
  statistics: boolean;
  marketing: boolean;
  acceptedAt: string;
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [statistics, setStatistics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (prefs: Omit<Prefs, "acceptedAt" | "essential">) => {
    const data: Prefs = { essential: true, acceptedAt: new Date().toISOString(), ...prefs };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    setVisible(false);
    setOpen(false);
  };

  const acceptAll = () => save({ statistics: true, marketing: true });
  const rejectOptional = () => save({ statistics: false, marketing: false });
  const savePrefs = () => save({ statistics, marketing });

  if (!visible) return null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Aviso de cookies"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg"
      >
        <div className="section-container py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <p className="text-sm text-foreground/90 max-w-3xl">
            Este portal utiliza cookies próprios e de terceiros para melhorar a navegação,
            realizar análises estatísticas e exibir anúncios personalizados através de serviços como
            Google AdSense e Google Analytics. Ao continuar utilizando o site, você concorda com o uso
            dessas tecnologias conforme descrito em nossa{" "}
            <Link to="/politica-de-cookies" className="underline text-primary">Política de Cookies</Link>{" "}
            e{" "}
            <Link to="/politica-de-privacidade" className="underline text-primary">Política de Privacidade</Link>.
          </p>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              Configurações
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/politica-de-cookies">Saiba mais</Link>
            </Button>
            <Button size="sm" onClick={acceptAll}>
              Aceitar cookies
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurações de Privacidade</DialogTitle>
            <DialogDescription>
              Utilizamos cookies essenciais para funcionamento do portal e cookies opcionais para análise,
              estatísticas e publicidade personalizada. Você pode aceitar todos ou personalizar suas preferências.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label className="font-semibold">Cookies Essenciais</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Necessários para funcionamento correto do site.
                </p>
              </div>
              <Switch checked disabled />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label htmlFor="stats" className="font-semibold">Cookies Estatísticos</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Ajudam a entender como os visitantes utilizam o portal.
                </p>
              </div>
              <Switch id="stats" checked={statistics} onCheckedChange={setStatistics} />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label htmlFor="mkt" className="font-semibold">Cookies de Marketing</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Utilizados para personalização de anúncios e campanhas publicitárias.
                </p>
              </div>
              <Switch id="mkt" checked={marketing} onCheckedChange={setMarketing} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={rejectOptional}>Recusar opcionais</Button>
            <Button variant="secondary" onClick={savePrefs}>Salvar preferências</Button>
            <Button onClick={acceptAll}>Aceitar todos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
