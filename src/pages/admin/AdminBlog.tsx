import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SEOFields } from "@/components/admin/SEOFields";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";

const emptyForm = { titulo: "", slug: "", conteudo: "", resumo: "", categoria: "", imagens: [] as string[], publicado: false, meta_title: "", meta_description: "", meta_keywords: "" };

export default function AdminBlog() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        titulo: form.titulo.trim(),
        slug: form.slug.trim(),
        conteudo: form.conteudo,
        resumo: form.resumo.trim() || null,
        categoria: form.categoria.trim(),
        imagem_url: form.imagens[0] || null,
        publicado: form.publicado,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        meta_keywords: form.meta_keywords.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Salvo!"); qc.invalidateQueries({ queryKey: ["admin-blog"] }); resetForm(); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("blog_posts").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido!"); qc.invalidateQueries({ queryKey: ["admin-blog"] }); },
  });

  const resetForm = () => { setForm(emptyForm); setEditing(null); setCreating(false); };
  const startEdit = (p: any) => {
    setEditing(p); setCreating(true);
    setForm({ titulo: p.titulo, slug: p.slug, conteudo: p.conteudo, resumo: p.resumo || "", categoria: p.categoria, imagens: p.imagem_url ? [p.imagem_url] : [], publicado: p.publicado, meta_title: p.meta_title || "", meta_description: p.meta_description || "", meta_keywords: p.meta_keywords || "" });
  };

  const generateSlug = () => {
    setForm({ ...form, slug: form.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Blog</h1>
        {!creating && <Button onClick={() => { resetForm(); setCreating(true); }}><Plus className="h-4 w-4 mr-2" /> Novo Post</Button>}
      </div>
      {creating && (
        <div className="bg-background rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold">{editing ? "Editar" : "Novo"} Post</h2>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} onBlur={() => !form.slug && generateSlug()} /></div>
            <div><Label>Slug</Label><div className="flex gap-2"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><Button type="button" variant="outline" size="sm" onClick={generateSlug}>Gerar</Button></div></div>
            <div><Label>Categoria</Label><Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></div>
            <div className="sm:col-span-2">
              <ImageUpload value={form.imagens} onChange={(urls) => setForm({ ...form, imagens: urls })} max={1} folder="blog" label="Imagem de Capa" hint="Tamanho ideal: 1200×630px" />
            </div>
            <div className="sm:col-span-2"><Label>Resumo</Label><Textarea value={form.resumo} onChange={(e) => setForm({ ...form, resumo: e.target.value })} rows={2} /></div>
            <div className="sm:col-span-2">
              <Label>Conteúdo</Label>
              <RichTextEditor value={form.conteudo} onChange={(html) => setForm({ ...form, conteudo: html })} folder="blog" />
            </div>
            <SEOFields metaTitle={form.meta_title} metaDescription={form.meta_description} metaKeywords={form.meta_keywords} onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))} titulo={form.titulo} conteudo={form.conteudo || form.resumo} contexto={`Post de blog técnico sobre ${form.categoria || "impressoras térmicas"}`} />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} id="publicado" />
              <Label htmlFor="publicado">Publicado</Label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate()} disabled={!form.titulo.trim() || !form.slug.trim() || !form.conteudo.trim() || saveMutation.isPending}>{saveMutation.isPending ? "Salvando..." : "Salvar"}</Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="space-y-2">
          {(items || []).map((p: any) => (
            <div key={p.id} className="flex items-center gap-4 bg-background rounded-md border border-border px-4 py-3">
              {p.imagem_url && <img src={p.imagem_url} alt="" className="h-10 w-10 object-cover rounded" />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{p.titulo}</p>
                  {p.publicado ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground">{p.categoria} · /{p.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="p-2 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteMutation.mutate(p.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {(items || []).length === 0 && <p className="text-muted-foreground text-sm">Nenhum post cadastrado.</p>}
        </div>
      )}
    </div>
  );
}
