import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  folder?: string;
  label?: string;
  hint?: string;
}

export function ImageUpload({ value, onChange, max = 5, folder = "general", label = "Imagens", hint }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = max - value.length;
    if (remaining <= 0) {
      toast.error(`Máximo de ${max} imagens`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const newUrls: string[] = [];
      for (const file of toUpload) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error } = await supabase.storage.from("images").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (error) throw error;

        const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
        newUrls.push(urlData.publicUrl);
      }

      onChange([...value, ...newUrls]);
      toast.success(`${newUrls.length} imagem(ns) enviada(s)`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-2">{hint}</p>}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-2 mb-3">
          {value.map((url, i) => (
            <div key={i} className="relative group w-24 h-24 rounded-md overflow-hidden border border-border bg-muted">
              <img src={url} alt="" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < max && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={max > 1}
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" /> Enviar imagem{max > 1 ? "(ns)" : ""}</>
            )}
          </Button>
          <span className="text-xs text-muted-foreground ml-2">
            {value.length}/{max} · Ideal: 800×800px
          </span>
        </div>
      )}
    </div>
  );
}
