import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Printer, Cpu, Download, BookOpen, Tag, FileText } from "lucide-react";

function StatCard({ label, count, icon: Icon }: { label: string; count: number; icon: any }) {
  return (
    <div className="bg-background rounded-lg border border-border p-6 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-foreground">{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminHome() {
  const counts = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [printers, drivers, softwares, tutorials, materials, blog] = await Promise.all([
        supabase.from("printers").select("id", { count: "exact", head: true }),
        supabase.from("drivers").select("id", { count: "exact", head: true }),
        supabase.from("softwares").select("id", { count: "exact", head: true }),
        supabase.from("tutorials").select("id", { count: "exact", head: true }),
        supabase.from("materials").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);
      return {
        printers: printers.count ?? 0,
        drivers: drivers.count ?? 0,
        softwares: softwares.count ?? 0,
        tutorials: tutorials.count ?? 0,
        materials: materials.count ?? 0,
        blog: blog.count ?? 0,
      };
    },
  });

  const c = counts.data || { printers: 0, drivers: 0, softwares: 0, tutorials: 0, materials: 0, blog: 0 };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Painel Administrativo</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Impressoras" count={c.printers} icon={Printer} />
        <StatCard label="Drivers" count={c.drivers} icon={Cpu} />
        <StatCard label="Softwares" count={c.softwares} icon={Download} />
        <StatCard label="Tutoriais" count={c.tutorials} icon={BookOpen} />
        <StatCard label="Materiais" count={c.materials} icon={Tag} />
        <StatCard label="Posts do Blog" count={c.blog} icon={FileText} />
      </div>
    </div>
  );
}
