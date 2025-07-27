import React, { useState, useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
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
import { TiptapToolbar } from "@/components/tiptap/toolbar";

export interface Email {
  id: string;
  subject: string;
  delay: number;
  delayUnit: "minutes" | "hours" | "days";
  body: string;
}

interface EmailEditDialogProps {
  // OPTIMIZATION: `initialEmail` is now just a key to trigger updates.
  // The component will be fully uncontrolled internally.
  initialEmail: Email | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedEmail: Email) => void;
}

// OPTIMIZATION: Memoize the entire dialog component.
// It will now only re-render if its props (like `isOpen` or `initialEmail`) change.
export const EmailEditDialog = React.memo(
  ({ initialEmail, isOpen, onOpenChange, onSave }: EmailEditDialogProps) => {
    // OPTIMIZATION: Internal state to manage the form. This is the key change.
    // The parent component is no longer involved in every keystroke.
    const [internalEmail, setInternalEmail] = useState<Partial<Email>>(
      initialEmail || {},
    );

    const editor = useEditor({
      extensions: [
        StarterKit.configure({ heading: { levels: [2, 3] } }),
        Placeholder.configure({
          placeholder: "Write your email content here…",
        }),
      ],
      editorProps: {
        attributes: {
          class:
            "prose dark:prose-invert prose-sm min-h-[250px] focus:outline-none p-4",
        },
      },
      // OPTIMIZATION: Update internal state on editor changes, not parent state.
      onUpdate: ({ editor }) => {
        setInternalEmail((prev) => ({ ...prev, body: editor.getHTML() }));
      },
    });

    // Effect to re-populate internal state ONLY when the dialog is opened with a new email.
    useEffect(() => {
      if (initialEmail && isOpen) {
        setInternalEmail(initialEmail);
        // Set editor content only when the initialEmail changes.
        if (editor && editor.getHTML() !== initialEmail.body) {
          editor.commands.setContent(initialEmail.body);
        }
      }
    }, [initialEmail, isOpen, editor]);

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

    const handleSaveClick = () => {
      // Only when the user clicks "Save" do we communicate with the parent.
      if (initialEmail) {
        onSave({ ...initialEmail, ...internalEmail } as Email);
      }
    };

    // Memoize the toolbar to prevent re-renders on editor content change
    const MemoizedToolbar = useMemo(
      () => <TiptapToolbar editor={editor} />,
      [editor],
    );

    if (!isOpen) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[750px] bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Edit Email</DialogTitle>
            <DialogDescription>
              Modify details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
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

            <div className="grid w-full gap-2">
              <Label>Email Body</Label>
              <div className="rounded-md border border-input">
                {MemoizedToolbar}
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveClick}
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

EmailEditDialog.displayName = "EmailEditDialog";
