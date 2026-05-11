import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const emptyForm = {
  nome: "", categoria: "", descricao: "", link_produto: "", imagens: [] as string[],
  conteudo: "", slug: "", meta_title: "", meta_description: "", meta_keywords: "",
};

function generateSlug(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminMaterials() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-materials"],
    queryFn: async () => {
      const { data } = await supabase.from("materials").select("*").order("categoria").order("nome");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug.trim() || generateSlug(form.nome);
      const payload: any = {
        nome: form.nome.trim(), categoria: form.categoria.trim(),
        descricao: form.descricao || null,
        conteudo: form.conteudo || null,
        link_produto: form.link_produto.trim() || null,
        imagem_url: form.imagens[0] || null,
        slug,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        meta_keywords: form.meta_keywords.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("materials").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("materials").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Salvo!"); qc.invalidateQueries({ queryKey: ["admin-materials"] }); resetForm(); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("materials").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido!"); qc.invalidateQueries({ queryKey: ["admin-materials"] }); },
  });

  const resetForm = () => { setForm(emptyForm); setEditing(null); setCreating(false); };
  const startEdit = (m: any) => {
    setEditing(m); setCreating(true);
    setForm({
      nome: m.nome, categoria: m.categoria, descricao: m.descricao || "",
      link_produto: m.link_produto || "", imagens: m.imagem_url ? [m.imagem_url] : [],
      conteudo: m.conteudo || "", slug: m.slug || "",
      meta_title: m.meta_title || "", meta_description: m.meta_description || "", meta_keywords: m.meta_keywords || "",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Materiais</h1>
        {!creating && <Button onClick={() => { resetForm(); setCreating(true); }}><Plus className="h-4 w-4 mr-2" /> Novo Material</Button>}
      </div>
      {creating && (
        <div className="bg-background rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold">{editing ? "Editar" : "Novo"} Material</h2>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div><Label>Categoria</Label><Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Etiqueta, Ribbon" /></div>
            <div><Label>Slug (URL)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Auto-gerado se vazio" /></div>
            <div><Label>Link do Produto</Label><Input value={form.link_produto} onChange={(e) => setForm({ ...form, link_produto: e.target.value })} /></div>
            <div className="sm:col-span-2">
              <ImageUpload value={form.imagens} onChange={(urls) => setForm({ ...form, imagens: urls })} max={3} folder="materials" label="Imagens do Material" hint="Tamanho ideal: 800×800px. Máximo 3 imagens." />
            </div>
            <div className="sm:col-span-2">
              <Label>Descrição Breve</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Breve descrição para listagens" />
            </div>
            <div className="sm:col-span-2">
              <Label>Conteúdo Completo</Label>
              <RichTextEditor value={form.conteudo} onChange={(html) => setForm({ ...form, conteudo: html })} folder="materials" />
            </div>
            <SEOFields
              metaTitle={form.meta_title} metaDescription={form.meta_description} metaKeywords={form.meta_keywords}
              onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
              titulo={form.nome} conteudo={form.conteudo || form.descricao}
              contexto={`Material/insumo: ${form.categoria || "etiquetas/ribbons"}`}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate()} disabled={!form.nome.trim() || !form.categoria.trim() || saveMutation.isPending}>{saveMutation.isPending ? "Salvando..." : "Salvar"}</Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="space-y-2">
          {(items || []).map((m: any) => (
            <div key={m.id} className="flex items-center gap-4 bg-background rounded-md border border-border px-4 py-3">
              {m.imagem_url && <img src={m.imagem_url} alt={m.nome} className="h-10 w-10 object-contain rounded" />}
              <div className="flex-1"><p className="font-medium text-foreground">{m.nome}</p><p className="text-xs text-muted-foreground">{m.categoria}</p></div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(m)} className="p-2 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteMutation.mutate(m.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {(items || []).length === 0 && <p className="text-muted-foreground text-sm">Nenhum material cadastrado.</p>}
        </div>
      )}
    </div>
  );
}
