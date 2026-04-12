import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Driver = Database["public"]["Tables"]["drivers"]["Row"];

const emptyForm = { marca: "", modelo: "", nome: "", versao: "", sistema_operacional: "", link_download: "", ativo: true };

export default function AdminDrivers() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Driver | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: drivers, isLoading } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: async () => {
      const { data } = await supabase.from("drivers").select("*").order("marca").order("modelo");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        nome: form.nome.trim(),
        versao: form.versao.trim(),
        sistema_operacional: form.sistema_operacional.trim(),
        link_download: form.link_download.trim(),
        ativo: form.ativo,
      };
      if (editing) {
        const { error } = await supabase.from("drivers").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("drivers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Driver atualizado!" : "Driver cadastrado!");
      qc.invalidateQueries({ queryKey: ["admin-drivers"] });
      resetForm();
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drivers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Driver removido!");
      qc.invalidateQueries({ queryKey: ["admin-drivers"] });
    },
  });

  const resetForm = () => { setForm(emptyForm); setEditing(null); setCreating(false); };

  const startEdit = (d: Driver) => {
    setEditing(d);
    setCreating(true);
    setForm({ marca: d.marca, modelo: d.modelo, nome: d.nome, versao: d.versao, sistema_operacional: d.sistema_operacional, link_download: d.link_download, ativo: d.ativo });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Drivers</h1>
        {!creating && <Button onClick={() => { resetForm(); setCreating(true); }}><Plus className="h-4 w-4 mr-2" /> Novo Driver</Button>}
      </div>

      {creating && (
        <div className="bg-background rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold">{editing ? "Editar Driver" : "Novo Driver"}</h2>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Marca</Label><Input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Ex: Zebra" /></div>
            <div><Label>Modelo</Label><Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Ex: ZD220" /></div>
            <div><Label>Nome do Driver</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Driver Zebra ZD220" /></div>
            <div><Label>Versão</Label><Input value={form.versao} onChange={(e) => setForm({ ...form, versao: e.target.value })} placeholder="Ex: 5.1.7" /></div>
            <div><Label>Sistema Operacional</Label><Input value={form.sistema_operacional} onChange={(e) => setForm({ ...form, sistema_operacional: e.target.value })} placeholder="Ex: Windows 10/11" /></div>
            <div><Label>Link Download</Label><Input value={form.link_download} onChange={(e) => setForm({ ...form, link_download: e.target.value })} placeholder="https://..." /></div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} id="ativo" />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate()} disabled={!form.marca.trim() || !form.modelo.trim() || !form.nome.trim() || !form.link_download.trim() || saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="space-y-2">
          {(drivers || []).map((d) => (
            <div key={d.id} className="flex items-center gap-4 bg-background rounded-md border border-border px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{d.nome}</p>
                <p className="text-xs text-muted-foreground">{d.marca} {d.modelo} · v{d.versao} · {d.sistema_operacional} {!d.ativo && "· Inativo"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(d)} className="p-2 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteMutation.mutate(d.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {(drivers || []).length === 0 && <p className="text-muted-foreground text-sm">Nenhum driver cadastrado.</p>}
        </div>
      )}
    </div>
  );
}
