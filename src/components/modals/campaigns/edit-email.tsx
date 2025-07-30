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
import { Doc, Id } from "#/_generated/dataModel";
import { Eye, Edit } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SendTestMail } from "./send-test-mail";

type Email = Doc<"emails">;
type EmailForm = Omit<
  Email,
  "_id" | "_creationTime" | "createdBy" | "createdAt" | "campaignId"
>;

interface EmailEditDialogProps {
  id: Id<"emails">;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const EmailEditDialog = ({
  id,
  isOpen,
  onOpenChange,
}: EmailEditDialogProps) => {
  const email = useQuery(api.emails.getEmail, { id });
  const updateEmail = useMutation(api.emails.updateEmail);
  const { watch, register, control, handleSubmit, getValues, setValue } =
    useForm<EmailForm>({
      defaultValues: {
        ordering: email?.ordering || 0,
        subject: email?.subject || "",
        body: email?.body || "",
        delay: email?.delay || 0,
        delayUnit: email?.delayUnit || "days",
      },
      values: {
        ordering: email?.ordering || 0,
        subject: email?.subject || "",
        body: email?.body || "",
        delay: email?.delay || 0,
        delayUnit: email?.delayUnit || "days",
      },
    });

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [editorContent, setEditorContent] = useState(email?.body || "");

  const editorRef = useRef<EditorRef>(null);

  const handleContentChange = (html: string) => {
    setValue("body", html, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setPreviewHtml(html);
    setEditorContent(html);
  };

  //TODO: verify why it's needed
  const handleTabChange = async (value: string) => {
    if (value === "preview" && editorRef.current) {
      const emailHtml = await editorRef.current.exportToEmail();
      setPreviewHtml(emailHtml.html);
    }
    setActiveTab(value as "edit" | "preview");
  };

  const onSubmit = async (data: EmailForm) => {
    setLoading(true);
    console.log("Submitting email data:", data);
    try {
      await updateEmail({
        id,
        subject: data.subject,
        body: editorContent,
        delay: data.delay,
        delayUnit: data.delayUnit,
        ordering: data.ordering,
      });
      toast.success("Email updated successfully");
      setLoading(false);
    } catch (error) {
      toast.error(`Error updating email: ${(error as Error).message}`);
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
            <DialogTitle>Edit Email</DialogTitle>
            <DialogDescription>
              Modify details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {email ? (
            <>
              <div className="grid gap-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    className="col-span-3"
                    {...register("subject")}
                    defaultValue={getValues("subject")}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">When to send</Label>
                  <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="0"
                      defaultValue={getValues("delay")}
                      {...register("delay", { valueAsNumber: true })}
                    />
                    <Controller
                      name="delayUnit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                      )}
                    />
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
                      <TabsTrigger
                        value="edit"
                        className="flex items-center gap-2"
                      >
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
                          initialContent={getValues("body")}
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

              <DialogFooter className="mt-4">
                <SendTestMail />
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2 text-foreground" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-center text-muted-foreground">
              Loading email details...
            </div>
          )}
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

EmailEditDialog.displayName = "EmailEditDialog";
