import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "#/_generated/api";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SendTestMailProps {
  subject: string;
  body: string;
}

export const SendTestMail = ({ subject, body }: SendTestMailProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendTestEmail = useAction(api.sendMail.sendTestEmailWithContent);

  const handleSendTestEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await sendTestEmail({
        to: email.trim(),
        subject: subject || "Test Email",
        body: body || "<p>Test email body</p>",
      });

      toast.success(`Test email sent successfully to ${email}`);
      setOpen(false);
      setEmail("");
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error(`Failed to send test email: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          type="button"
          variant={"outline"}
          className="bg-secondary hover:bg-secondary-foreground/15 cursor-pointer"
        >
          Test Mail
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Input
          className="mb-4 border rounded-md border-accent"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <div className="w-full flex flex-row gap-2">
          <Button
            size="sm"
            type="button"
            onClick={handleSendTestEmail}
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Sending...
              </>
            ) : (
              "Send Test Email"
            )}
          </Button>
          <Button
            type="button"
            variant={"outline"}
            className="bg-secondary hover:bg-destructive cursor-pointer"
            onClick={() => {
              setOpen(false);
              setEmail("");
            }}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
