import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { TiptapToolbar } from "@/components/tiptap/toolbar";
import { forwardRef } from "react";

export interface EditorRef {
  getHTML: () => string;
  getJSON: () => any;
  exportToEmail: () => Promise<{ html: string; text: string }>;
}
interface EditorProps {
  initialContent?: string;
  onContentChange?: (html: string) => void; // ADD THIS
}

export const Editor = forwardRef<EditorRef, EditorProps>(
  ({ initialContent, onContentChange }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Placeholder.configure({
          placeholder: "Write your email content here…",
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-600 underline cursor-pointer",
          },
        }),
        Image.configure({
          inline: true,
          allowBase64: false,
          HTMLAttributes: {
            style: "max-width:100%; height:16rem; border-radius:0.5rem;",
          },
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Underline,
        HorizontalRule,
      ],
      content: initialContent || "",
      onUpdate: ({ editor }) => {
        // ADD THIS
        if (onContentChange) {
          onContentChange(editor.getHTML());
        }
      },
      editorProps: {
        attributes: {
          class:
            "prose dark:prose-invert prose-sm min-h-[250px] max-h-[350px] overflow-y-scroll focus:outline-none p-4 max-w-none",
        },
      },
    });

    const editorState = useEditorState({
      editor: editor,
      selector: (ctx) => {
        if (!ctx.editor || !ctx.editor.view) return null;
        return {
          isBold: ctx.editor.isActive("bold"),
          isItalic: ctx.editor.isActive("italic"),
          isUnderline: ctx.editor.isActive("underline"),
          isStrike: ctx.editor.isActive("strike"),
          isLink: ctx.editor.isActive("link"),
          isHeading1: ctx.editor.isActive("heading", { level: 1 }),
          isHeading2: ctx.editor.isActive("heading", { level: 2 }),
          isHeading3: ctx.editor.isActive("heading", { level: 3 }),
          isBulletList: ctx.editor.isActive("bulletList"),
          isOrderedList: ctx.editor.isActive("orderedList"),
          isBlockquote: ctx.editor.isActive("blockquote"),
          isAlignLeft: ctx.editor.isActive({ textAlign: "left" }),
          isAlignCenter: ctx.editor.isActive({ textAlign: "center" }),
          isAlignRight: ctx.editor.isActive({ textAlign: "right" }),
          isAlignJustify: ctx.editor.isActive({ textAlign: "justify" }),
          canUndo: ctx.editor.can().chain().focus().undo().run(),
          canRedo: ctx.editor.can().chain().focus().redo().run(),
        };
      },
    });

    //TODO: Export HTML content
    const html = editor && editor.getHTML();
    console.log("Exporting email HTML:", html);

    return (
      <div className="border rounded-lg overflow-hidden">
        <TiptapToolbar editor={editor} editorState={editorState} />
        <EditorContent editor={editor} />
      </div>
    );
  },
);
