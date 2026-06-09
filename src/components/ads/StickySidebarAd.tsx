import { useEffect, useState } from "react";
import { AdSlot } from "./AdSlot";

type Props = {
  slot?: string;
  pageType?: string;
};

/**
 * Anúncio sticky na sidebar — desktop apenas (>=1200px).
 * Para de acompanhar o scroll antes do footer.
 */
export function StickySidebarAd({ slot, pageType }: Props) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const check = () => setEnabled(window.innerWidth >= 1200);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!enabled) return null;

  return (
    <div className="hidden xl:block sticky top-24 self-start">
      <AdSlot
        position="sidebar"
        pageType={pageType}
        slot={slot}
        minHeight={600}
        label="Publicidade"
      />
    </div>
  );
}
