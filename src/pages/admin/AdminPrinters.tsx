import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Printer = Database["public"]["Tables"]["printers"]["Row"];

export default function AdminPrinters() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Printer | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ marca: "", modelo: "", descricao: "", imagens: [] as string[] });

  const { data: printers, isLoading } = useQuery({
    queryKey: ["admin-printers"],
    queryFn: async () => {
      const { data } = await supabase.from("printers").select("*").order("marca").order("modelo");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        descricao: form.descricao.trim() || null,
        imagem_url: form.imagens[0] || null,
        imagens: form.imagens,
      };
      if (editing) {
        const { error } = await supabase.from("printers").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("printers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Impressora atualizada!" : "Impressora cadastrada!");
      qc.invalidateQueries({ queryKey: ["admin-printers"] });
      resetForm();
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("printers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Impressora removida!");
      qc.invalidateQueries({ queryKey: ["admin-printers"] });
    },
    onError: () => toast.error("Erro ao remover"),
  });

  const resetForm = () => {
    setForm({ marca: "", modelo: "", descricao: "", imagens: [] });
    setEditing(null);
    setCreating(false);
  };

  const startEdit = (p: Printer) => {
    setEditing(p);
    setCreating(true);
    const imgs = (p as any).imagens?.length ? (p as any).imagens : (p.imagem_url ? [p.imagem_url] : []);
    setForm({ marca: p.marca, modelo: p.modelo, descricao: p.descricao || "", imagens: imgs });
  };

  const grouped = (printers || []).reduce<Record<string, Printer[]>>((acc, p) => {
    (acc[p.marca] = acc[p.marca] || []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Impressoras</h1>
        {!creating && (
          <Button onClick={() => { resetForm(); setCreating(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nova Impressora
          </Button>
        )}
      </div>

      {creating && (
        <div className="bg-background rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold">{editing ? "Editar Impressora" : "Nova Impressora"}</h2>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Marca</Label>
              <Input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Ex: Zebra" />
            </div>
            <div>
              <Label>Modelo</Label>
              <Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Ex: ZD220" />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                value={form.imagens}
                onChange={(urls) => setForm({ ...form, imagens: urls })}
                max={5}
                folder="printers"
                label="Imagens da Impressora"
                hint="Tamanho ideal: 800×800px. Máximo 5 imagens."
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate()} disabled={!form.marca.trim() || !form.modelo.trim() || saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([marca, items]) => (
          <div key={marca} className="mb-6">
            <h3 className="font-heading font-bold text-lg text-foreground mb-3 border-b border-border pb-2">{marca}</h3>
            <div className="space-y-2">
              {items.map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-background rounded-md border border-border px-4 py-3">
                  {p.imagem_url && <img src={p.imagem_url} alt={p.modelo} className="h-10 w-10 object-contain rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{p.modelo}</p>
                    {p.descricao && <p className="text-xs text-muted-foreground truncate">{p.descricao}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="p-2 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(p.id)} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
