import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { SEOFields } from "@/components/admin/SEOFields";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

const emptyForm = { nome: "", descricao: "", versao: "", link_download: "", conteudo: "", imagem_url: "", meta_title: "", meta_description: "", meta_keywords: "" };

export default function AdminSoftwares() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-softwares"],
    queryFn: async () => {
      const { data } = await supabase.from("softwares").select("*").order("nome");
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        nome: form.nome.trim(), descricao: form.descricao.trim() || null, versao: form.versao.trim(), link_download: form.link_download.trim(),
        conteudo: form.conteudo || null,
        imagem_url: form.imagem_url.trim() || null,
        meta_title: form.meta_title.trim() || null, meta_description: form.meta_description.trim() || null, meta_keywords: form.meta_keywords.trim() || null,
      };
      if (editing) {
        const { error } = await supabase.from("softwares").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("softwares").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success("Salvo!"); qc.invalidateQueries({ queryKey: ["admin-softwares"] }); resetForm(); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("softwares").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Removido!"); qc.invalidateQueries({ queryKey: ["admin-softwares"] }); },
  });

  const resetForm = () => { setForm(emptyForm); setEditing(null); setCreating(false); };
  const startEdit = (s: any) => {
    setEditing(s); setCreating(true);
    setForm({ nome: s.nome, descricao: s.descricao || "", versao: s.versao, link_download: s.link_download, conteudo: s.conteudo || "", imagem_url: s.imagem_url || "", meta_title: s.meta_title || "", meta_description: s.meta_description || "", meta_keywords: s.meta_keywords || "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Softwares</h1>
        {!creating && <Button onClick={() => { resetForm(); setCreating(true); }}><Plus className="h-4 w-4 mr-2" /> Novo Software</Button>}
      </div>
      {creating && (
        <div className="bg-background rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold">{editing ? "Editar" : "Novo"} Software</h2>
            <button onClick={resetForm}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div><Label>Versão</Label><Input value={form.versao} onChange={(e) => setForm({ ...form, versao: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Link Download</Label><Input value={form.link_download} onChange={(e) => setForm({ ...form, link_download: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Descrição Breve</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Breve descrição para listagens" /></div>
            <div className="sm:col-span-2">
              <ImageUpload
                value={form.imagem_url ? [form.imagem_url] : []}
                onChange={(urls) => setForm({ ...form, imagem_url: urls[0] || "" })}
                max={1}
                folder="softwares"
                label="Imagem do Software"
                hint="Logo ou ícone exibido no card e na página de detalhes."
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Conteúdo Completo</Label>
              <RichTextEditor value={form.conteudo} onChange={(html) => setForm({ ...form, conteudo: html })} folder="softwares" />
            </div>
            <SEOFields metaTitle={form.meta_title} metaDescription={form.meta_description} metaKeywords={form.meta_keywords} onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))} titulo={`${form.nome} ${form.versao}`.trim()} conteudo={form.conteudo || form.descricao} contexto="Página de download de software para impressoras" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate()} disabled={!form.nome.trim() || !form.link_download.trim() || saveMutation.isPending}>{saveMutation.isPending ? "Salvando..." : "Salvar"}</Button>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="space-y-2">
          {(items || []).map((s: any) => (
            <div key={s.id} className="flex items-center gap-4 bg-background rounded-md border border-border px-4 py-3">
              <div className="flex-1"><p className="font-medium text-foreground">{s.nome}</p><p className="text-xs text-muted-foreground">v{s.versao}</p></div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="p-2 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => deleteMutation.mutate(s.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {(items || []).length === 0 && <p className="text-muted-foreground text-sm">Nenhum software cadastrado.</p>}
        </div>
      )}
    </div>
  );
}
