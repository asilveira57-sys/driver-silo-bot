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

type Tutorial = Database["public"]["Tables"]["tutorials"]["Row"];
const emptyForm = { titulo: "", slug: "", conteudo: "", categoria: "", imagens: [] as string[] };

export default function AdminTutorials() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-tutorials"],
    queryFn: async () => {
      const { data } = await supabase.from("tutorials").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        titulo: form.titulo.trim(),
        slug: form.slug.trim(),
        conteudo: form.conteudo.trim(),
        categoria: form.categoria.trim(),
        imagem_url: form.imagens[0] || null,
      };
      if (editing) {
        const { error } = await supabase.from("tutorials").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tutorials").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Salvo!"); qc.invalidateQueries({ queryKey: ["admin-tutorials"] }); resetForm(); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("tutorials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido!"); qc.invalidateQueries({ queryKey: ["admin-tutorials"] }); },
  });

  const resetForm = () => { setForm(emptyForm); setEditing(null); setCreating(false); };
  const startEdit = (t: Tutorial) => {
    setEditing(t); setCreating(true);
    setForm({ titulo: t.titulo, slug: t.slug, conteudo: t.conteudo, categoria: t.categoria, imagens: t.imagem_url ? [t.imagem_url] : [] });
  };

  const generateSlug = () => {
    setForm({ ...form, slug: form.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Tutoriais</h1>
        {!creating && <Button onClick={() => { resetForm(); setCreating(true); }}><Plus className="h-4 w-4 mr-2" /> Novo Tutorial</Button>}
      </div>
      {creating && (
        <div className="bg-background rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold">{editing ? "Editar" : "Novo"} Tutorial</h2>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} onBlur={() => !form.slug && generateSlug()} /></div>
            <div><Label>Slug</Label><div className="flex gap-2"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><Button type="button" variant="outline" size="sm" onClick={generateSlug}>Gerar</Button></div></div>
            <div><Label>Categoria</Label><Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Instalação" /></div>
            <div className="sm:col-span-2">
              <ImageUpload
                value={form.imagens}
                onChange={(urls) => setForm({ ...form, imagens: urls })}
                max={1}
                folder="tutorials"
                label="Imagem de Capa"
                hint="Tamanho ideal: 1200×630px"
              />
            </div>
            <div className="sm:col-span-2"><Label>Conteúdo</Label><Textarea value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} rows={10} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate()} disabled={!form.titulo.trim() || !form.slug.trim() || !form.conteudo.trim() || saveMutation.isPending}>{saveMutation.isPending ? "Salvando..." : "Salvar"}</Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="space-y-2">
          {(items || []).map((t) => (
            <div key={t.id} className="flex items-center gap-4 bg-background rounded-md border border-border px-4 py-3">
              {t.imagem_url && <img src={t.imagem_url} alt={t.titulo} className="h-10 w-10 object-cover rounded" />}
              <div className="flex-1"><p className="font-medium text-foreground">{t.titulo}</p><p className="text-xs text-muted-foreground">{t.categoria} · /{t.slug}</p></div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(t)} className="p-2 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteMutation.mutate(t.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {(items || []).length === 0 && <p className="text-muted-foreground text-sm">Nenhum tutorial cadastrado.</p>}
        </div>
      )}
    </div>
  );
}
