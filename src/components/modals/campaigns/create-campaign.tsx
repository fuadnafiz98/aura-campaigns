// components/modals/create-campaign.tsx
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignModal({
  open,
  onOpenChange,
}: CreateCampaignModalProps) {
  const [campaignName, setCampaignName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    targetAudience?: string;
  }>({});

  const createCampaign = useMutation(api.campaigns.createCampaign);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!campaignName.trim()) {
      newErrors.name = "Campaign name is required";
    } else if (campaignName.length < 3) {
      newErrors.name = "Campaign name must be at least 3 characters";
    }

    if (!targetAudience.trim()) {
      newErrors.targetAudience = "Target audience is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);

    try {
      await createCampaign({
        name: campaignName.trim(),
        targetAudience: targetAudience.trim(),
        status: "draft", // New campaigns start as draft
      });

      toast.success(`Successfully created campaign "${campaignName}"`);

      // Reset form and close modal
      setCampaignName("");
      setTargetAudience("");
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast.error("Failed to create campaign. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setCampaignName("");
      setTargetAudience("");
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Create a new email campaign by providing a name and defining your
              target audience.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="e.g., Summer Sale 2024"
                value={campaignName}
                onChange={(e) => {
                  setCampaignName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: undefined });
                  }
                }}
                disabled={isCreating}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target-audience">Target Audience</Label>
              <Textarea
                id="target-audience"
                placeholder="Describe your target audience (e.g., Small business owners in tech industry, ages 25-45)"
                value={targetAudience}
                onChange={(e) => {
                  setTargetAudience(e.target.value);
                  if (errors.targetAudience) {
                    setErrors({ ...errors, targetAudience: undefined });
                  }
                }}
                disabled={isCreating}
                className={errors.targetAudience ? "border-destructive" : ""}
                rows={3}
              />
              {errors.targetAudience && (
                <p className="text-sm text-destructive">
                  {errors.targetAudience}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isCreating}
            >
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
