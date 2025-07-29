import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  QuoteIcon,
  Redo,
  Undo,
} from "lucide-react";

export const TiptapToolbar = ({
  editor,
  editorState,
}: {
  editor: Editor;
  editorState: any;
}) => {
  if (!editor) return null;
  return (
    <div className="border flex flex-wrap gap-2  bg-background p-2 rounded-none">
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
        className="cursor-pointer"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
        className="cursor-pointer"
      >
        <Redo className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          (editorState && editorState.isBold
            ? "bg-neutral-700 text-foreground"
            : "text-muted-foreground hover:bg-muted") + " cursor-pointer"
        }
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          (editor.isActive("italic")
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted") + " cursor-pointer"
        }
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={
          (editor.isActive("heading", { level: 1 })
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted") + " cursor-pointer"
        }
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          (editor.isActive("heading", { level: 2 })
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted") + " cursor-pointer"
        }
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          (editor.isActive("bulletList")
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted") + " cursor-pointer"
        }
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          (editor.isActive("orderedList")
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted") + " cursor-pointer"
        }
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          (editor.isActive("blockquote")
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted") + " cursor-pointer"
        }
        title="Blockquote"
      >
        <QuoteIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};
