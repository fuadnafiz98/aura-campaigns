import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CreateAudienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadIds?: Id<"leads">[];
  onSuccess?: () => void;
}

export const CreateAudienceModal = ({
  open,
  onOpenChange,
  leadIds,
  onSuccess,
}: CreateAudienceModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const createAudience = useMutation(api.audiences.createAudience);
  const addLeadsToAudience = useMutation(api.audiences.addLeadsToAudiencePublic);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Audience name is required");
      return;
    }

    setLoading(true);
    try {
      const audienceId = await createAudience({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      // If leadIds are provided, add them to the newly created audience
      if (leadIds && leadIds.length > 0) {
        const result = await addLeadsToAudience({
          audienceId,
          leadIds,
        });
        
        toast.success(`Audience created successfully with ${result.addedCount} leads added`);
      } else {
        toast.success("Audience created successfully");
      }

      setName("");
      setDescription("");
      onOpenChange(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(`Error creating audience: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Audience</DialogTitle>
            <DialogDescription>
              {leadIds && leadIds.length > 0 
                ? `Create a new audience group and add ${leadIds.length} selected leads to it.`
                : "Create a new audience group to organize your leads."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter audience name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this audience..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                "Create Audience"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
