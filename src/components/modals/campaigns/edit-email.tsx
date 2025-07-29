import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor, EditorRef } from "@/components/tiptap/tiptap";
import { Doc } from "#/_generated/dataModel";
import { Eye, Edit } from "lucide-react";

type Email = Doc<"emails">;

interface EmailEditDialogProps {
  initialEmail: Email | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedEmail: Email) => void;
}

export const EmailEditDialog = ({
  initialEmail,
  isOpen,
  onOpenChange,
  onSave,
}: EmailEditDialogProps) => {
  const [internalEmail, setInternalEmail] = useState<Partial<Email>>(
    initialEmail || {},
  );
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewHtml, setPreviewHtml] = useState("");
  const [editorContent, setEditorContent] = useState(initialEmail?.body || ""); // ADD THIS

  const editorRef = useRef<EditorRef>(null);

  const handleContentChange = (html: string) => {
    console.log("Content changed:", html);
    setPreviewHtml(html);
    setEditorContent(html);
  };
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalEmail((prev) => ({ ...prev, subject: e.target.value }));
  };

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalEmail((prev) => ({
      ...prev,
      delay: parseInt(e.target.value, 10) || 0,
    }));
  };

  const handleDelayUnitChange = (value: "minutes" | "hours" | "days") => {
    setInternalEmail((prev) => ({ ...prev, delayUnit: value }));
  };

  const handleTabChange = async (value: string) => {
    if (value === "preview" && editorRef.current) {
      const emailHtml = await editorRef.current.exportToEmail();
      setPreviewHtml(emailHtml.html);
    }
    setActiveTab(value as "edit" | "preview");
  };

  const handleSaveClick = async (_e: any) => {
    if (initialEmail && editorRef.current) {
      const content = editorRef.current.getHTML();
      const emailData = await editorRef.current.exportToEmail();

      onSave({
        ...initialEmail,
        ...internalEmail,
        body: content,
        emailHtml: emailData.html,
      } as Email);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[900px] max-h-[90vh] bg-zinc-950 border-zinc-800"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Email</DialogTitle>
          <DialogDescription>
            Modify details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject
            </Label>
            <Input
              id="subject"
              value={internalEmail.subject || ""}
              onChange={handleSubjectChange}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">When to send</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={internalEmail.delay ?? 0}
                onChange={handleDelayChange}
                min="0"
              />
              <Select
                value={internalEmail.delayUnit || "days"}
                onValueChange={handleDelayUnitChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid w-full gap-4">
            <Label>Email Body</Label>
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-4">
                <div className="rounded-md border border-input">
                  <Editor
                    ref={editorRef}
                    initialContent={editorContent}
                    onContentChange={handleContentChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="rounded-md border border-input bg-white mt-4">
                  <EmailPreview html={previewHtml} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={(e) => void handleSaveClick(e)}
            type="submit"
            className="bg-primary hover:bg-primary/90"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Email Preview Component
const EmailPreview = ({ html }: { html: string }) => {
  return (
    <div className="w-full h-[500px] overflow-hidden">
      <iframe
        srcDoc={html}
        className="w-full h-full border-0"
        title="Email Preview"
        sandbox="allow-same-origin"
      />
    </div>
  );
};

EmailEditDialog.displayName = "EmailEditDialog";
