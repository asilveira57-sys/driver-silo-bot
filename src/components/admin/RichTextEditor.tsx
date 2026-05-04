import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Image as ImageIcon, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight,
  Code, Undo, Redo, FileCode,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  folder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Escreva o conteúdo aqui...", folder = "content" }: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const sourceModeRef = useRef(false);

  // Keep ref in sync so editor onUpdate knows the current mode
  useEffect(() => { sourceModeRef.current = sourceMode; }, [sourceMode]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {},
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      // Only propagate visual-mode changes; source mode handles its own onChange
      if (!sourceModeRef.current) {
        onChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && !sourceMode && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor, sourceMode]);

  const toggleSource = useCallback(() => {
    if (sourceMode) {
      // Switching FROM source → visual: push HTML into editor
      editor?.commands.setContent(sourceCode, { emitUpdate: false });
      onChange(sourceCode);
      setSourceMode(false);
    } else {
      // Switching TO source: grab current HTML
      setSourceCode(editor?.getHTML() || "");
      setSourceMode(true);
    }
  }, [sourceMode, sourceCode, editor, onChange]);

  // Source code changes propagate immediately so Save always works
  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    setSourceCode(html);
    onChange(html);
  }, [onChange]);

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt || undefined, title: imageAlt || undefined } as any).run();
      setImageUrl("");
      setImageAlt("");
      setShowImageInput(false);
    }
  }, [imageUrl, imageAlt, editor]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("images").upload(path, file);
    if (error) return;
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(path);
    const altText = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    editor.chain().focus().setImage({ src: urlData.publicUrl, alt: altText, title: altText } as any).run();
    e.target.value = "";
  }, [editor, folder]);

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkInput(false);
    }
  }, [linkUrl, editor]);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
        {!sourceMode && (
          <>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1"><Heading1 className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2"><Heading2 className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3"><Heading3 className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-5 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Negrito"><Bold className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Itálico"><Italic className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Sublinhado"><UnderlineIcon className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Tachado"><Strikethrough className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-5 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lista"><List className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Lista Numerada"><ListOrdered className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-5 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Alinhar Esquerda"><AlignLeft className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centralizar"><AlignCenter className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Alinhar Direita"><AlignRight className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-5 bg-border mx-1" />
            <ToolBtn onClick={() => setShowImageInput(!showImageInput)} title="Inserir Imagem"><ImageIcon className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => setShowLinkInput(!showLinkInput)} active={editor.isActive("link")} title="Inserir Link"><LinkIcon className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Bloco de Código"><Code className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-5 bg-border mx-1" />
            <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Desfazer"><Undo className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Refazer"><Redo className="h-4 w-4" /></ToolBtn>
            <div className="w-px h-5 bg-border mx-1" />
          </>
        )}
        <ToolBtn onClick={toggleSource} active={sourceMode} title="Código Fonte HTML"><FileCode className="h-4 w-4" /></ToolBtn>
        {sourceMode && (
          <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
            Modo HTML — cole seu script aqui
          </span>
        )}
      </div>

      {/* Image URL input */}
      {showImageInput && !sourceMode && (
        <div className="flex flex-wrap items-center gap-2 p-2 border-b border-border bg-muted/20">
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL da imagem" className="flex-1 h-8 text-sm min-w-[200px]" onKeyDown={(e) => e.key === "Enter" && addImage()} />
          <Input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Texto alt (SEO)" className="w-48 h-8 text-sm" onKeyDown={(e) => e.key === "Enter" && addImage()} />
          <Button type="button" size="sm" variant="outline" onClick={addImage}>Inserir</Button>
          <span className="text-muted-foreground text-xs">ou</span>
          <label className="cursor-pointer text-xs text-primary hover:underline">
            Upload
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      )}

      {/* Link input */}
      {showLinkInput && !sourceMode && (
        <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/20">
          <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1 h-8 text-sm" onKeyDown={(e) => e.key === "Enter" && addLink()} />
          <Button type="button" size="sm" variant="outline" onClick={addLink}>Aplicar</Button>
          {editor.isActive("link") && (
            <Button type="button" size="sm" variant="ghost" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }}>Remover</Button>
          )}
        </div>
      )}

      {/* Editor / Source */}
      {sourceMode ? (
        <Textarea
          value={sourceCode}
          onChange={handleSourceChange}
          className="border-0 rounded-none min-h-[300px] font-mono text-sm focus-visible:ring-0"
          rows={15}
          placeholder="Cole seu HTML aqui. Ex: <h2>Título</h2><ul><li>Item</li></ul><img src='...' alt='...' />"
        />
      ) : (
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
        />
      )}
    </div>
  );
}
