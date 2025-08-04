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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor } from "@/components/tiptap/tiptap";
import { Eye, Edit, Send } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface FollowUpEmailForm {
  subject: string;
  body: string;
}

interface FollowUpEmailDialogProps {
  leadEmail: string;
  leadName: string;
  leadId: Id<"leads">;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contextSubject?: string;
}

export const FollowUpEmailDialog = ({
  leadEmail,
  leadName,
  leadId,
  isOpen,
  onOpenChange,
  contextSubject,
}: FollowUpEmailDialogProps) => {
  const sendFollowUpEmail = useAction(api.sendMail.sendFollowUpEmail);

  const defaultSubject = contextSubject
    ? `Re: ${contextSubject}`
    : `Follow up - ${leadName}`;

  const { register, handleSubmit, getValues, setValue, watch } =
    useForm<FollowUpEmailForm>({
      defaultValues: {
        subject: defaultSubject,
        body: `<p>Hi ${leadName.split(" ")[0]},</p><p>I wanted to follow up with you regarding our previous conversation.</p><p>Best regards,</p>`,
      },
      values: {
        subject: defaultSubject,
        body: `<p>Hi ${leadName.split(" ")[0]},</p><p>I wanted to follow up with you regarding our previous conversation.</p><p>Best regards,</p>`,
      },
    });

  const [loading, setLoading] = useState(false);
  const watchedBody = watch("body");

  const handleContentChange = (html: string) => {
    setValue("body", html, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: FollowUpEmailForm) => {
    if (!data.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!data.body.trim()) {
      toast.error("Please enter email content");
      return;
    }

    setLoading(true);
    try {
      await sendFollowUpEmail({
        to: leadEmail,
        subject: data.subject,
        body: data.body,
        leadId: leadId,
      });

      toast.success(`Follow-up email sent successfully to ${leadEmail}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending follow-up email:", error);
      toast.error(`Failed to send email: ${(error as Error).message}`);
    } finally {
      setLoading(false);
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Send Follow-Up Email
            </DialogTitle>
            <DialogDescription>
              Send a follow-up email to {leadName} ({leadEmail})
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to" className="text-right">
                To
              </Label>
              <Input
                id="to"
                className="col-span-3"
                value={leadEmail}
                disabled
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                className="col-span-3"
                {...register("subject", { required: true })}
              />
            </div>

            <div className="grid w-full gap-4">
              <Label>Email Body</Label>
              <Tabs className="w-full" defaultValue="edit">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="edit"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="mt-4">
                  <div className="rounded-md border border-input">
                    <Editor
                      initialContent={getValues("body")}
                      onContentChange={handleContentChange}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="rounded-md border border-input bg-white mt-4">
                    <EmailPreview html={watchedBody || ""} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2 text-foreground" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Email Preview Component
const EmailPreview = ({ html }: { html: string }) => {
  return (
    <div className="w-full min-h-[300px] h-[385px] overflow-hidden">
      <iframe
        srcDoc={html}
        className="w-full h-full border-0"
        title="Email Preview"
        sandbox="allow-same-origin"
      />
    </div>
  );
};

FollowUpEmailDialog.displayName = "FollowUpEmailDialog";
