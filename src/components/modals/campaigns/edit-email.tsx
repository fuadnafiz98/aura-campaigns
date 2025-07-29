import React, { useState } from "react";
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
import { Editor } from "@/components/tiptap/tiptap";
import { Doc } from "#/_generated/dataModel";

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
    if (initialEmail) {
      onSave({ ...initialEmail, ...internalEmail } as Email);
    }
  };

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
              <Editor />
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
};

EmailEditDialog.displayName = "EmailEditDialog";
