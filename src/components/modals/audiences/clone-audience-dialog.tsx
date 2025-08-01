import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CloneAudienceDialogProps {
  audienceId: Id<"audiences">;
  originalName: string;
  children: React.ReactNode;
}

export const CloneAudienceDialog = ({
  audienceId,
  originalName,
  children,
}: CloneAudienceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`${originalName} (Copy)`);
  const [loading, setLoading] = useState(false);

  const cloneAudience = useMutation(api.audiences.cloneAudience);

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Audience name is required");
      return;
    }

    setLoading(true);
    try {
      await cloneAudience({ id: audienceId, name: name.trim() });
      toast.success("Audience cloned successfully");
      setOpen(false);
      setName(`${originalName} (Copy)`); // Reset for next time
    } catch (error) {
      toast.error(`Error cloning audience: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setName(`${originalName} (Copy)`); // Reset name when opening
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clone Audience</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleClone} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Create a copy of "{originalName}" with all its leads.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clone-name" className="text-sm">
              New audience name
            </Label>
            <Input
              id="clone-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name for cloned audience"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <Copy className="mr-2 h-4 w-4 animate-pulse" />
                  Cloning...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Clone
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
