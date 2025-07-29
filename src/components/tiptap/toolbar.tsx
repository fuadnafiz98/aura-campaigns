import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Underline,
  List,
  ListOrdered,
  QuoteIcon,
  Redo,
  Undo,
  Link,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  Loader2,
  Upload,
  ImagePlusIcon,
} from "lucide-react";
import { useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "#/_generated/api";
import axios from "axios";
import { Progress } from "../ui/progress";

interface TiptapToolbarProps {
  editor: Editor | null;
  editorState: any;
}

export const TiptapToolbar = ({ editor, editorState }: TiptapToolbarProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.fileUpload.generateUploadUrl);
  const getImageUrl = useMutation(api.fileUpload.getImgUrl);

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
    }
  };

  const addImageFromUrl = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (e.g., 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingImage(true);

    try {
      const postURL = await generateUploadUrl();

      const response = await axios.post(postURL, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(progress);
          }
        },
      });

      console.log("Upload successful:", response.data);

      const { storageId } = await response.data;
      const imageUrl = await getImageUrl({ storageId });
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setIsUploadingImage(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
      setIsUploadingImage(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-b flex flex-wrap items-center gap-1 bg-background p-2">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editorState?.canUndo}
          title="Undo (Ctrl+Z)"
          className="h-8 w-8"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editorState?.canRedo}
          title="Redo (Ctrl+Y)"
          className="h-8 w-8"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 ${editorState?.isBold ? "bg-muted" : ""}`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 ${editorState?.isItalic ? "bg-muted" : ""}`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 w-8 ${editorState?.isUnderline ? "bg-muted" : ""}`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Headings */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`h-8 w-8 ${editorState?.isHeading1 ? "bg-muted" : ""}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`h-8 w-8 ${editorState?.isHeading2 ? "bg-muted" : ""}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`h-8 w-8 ${editorState?.isHeading3 ? "bg-muted" : ""}`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 ${editorState?.isBulletList ? "bg-muted" : ""}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 ${editorState?.isOrderedList ? "bg-muted" : ""}`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`h-8 w-8 ${editorState?.isAlignLeft ? "bg-muted" : ""}`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`h-8 w-8 ${editorState?.isAlignCenter ? "bg-muted" : ""}`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`h-8 w-8 ${editorState?.isAlignRight ? "bg-muted" : ""}`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`h-8 w-8 ${editorState?.isAlignJustify ? "bg-muted" : ""}`}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Links and Media */}
      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${editorState?.isLink ? "bg-muted" : ""}`}
              title="Add Link"
            >
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <Button onClick={addLink} className="w-full">
                Add Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {editorState?.isLink && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
            className="h-8 w-8"
          >
            <Unlink className="h-4 w-4" />
          </Button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="h-8 w-8 cursor-pointer"
              disabled={isUploadingImage}
            >
              <ImagePlusIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload from device</Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      void handleImageUpload(e);
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                        <Progress value={uploadProgress} className="h-2" />
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              {/* URL input */}
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImageFromUrl();
                    }
                  }}
                />
                <Button
                  onClick={addImageFromUrl}
                  className="w-full"
                  disabled={!imageUrl}
                >
                  Add Image from URL
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Other */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 w-8 ${editorState?.isBlockquote ? "bg-muted" : ""}`}
          title="Blockquote"
        >
          <QuoteIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
