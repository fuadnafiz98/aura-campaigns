import { useState, useCallback, useMemo } from "react";
import { Reorder, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleLine } from "@/components/animations/partical-line";
import { EmailCard } from "@/components/campaigns/email-card";
import { CampaignSchedulingStatus } from "@/components/campaigns/campaign-analytics";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Doc, Id } from "#/_generated/dataModel";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { PlayIcon } from "@/components/ui/play";
import { MultiSelector } from "@/components/ui/multi-selector";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Email = Doc<"emails">;

export default function EmailCampaignFlow() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  // Query campaign data
  const campaign = useQuery(
    api.campaigns.getCampaign,
    campaignId
      ? {
          id: campaignId as Id<"campaigns">,
        }
      : "skip",
  );

  const emails = useQuery(
    api.emails.emailsList,
    campaignId
      ? {
          campaignId: campaignId as Id<"campaigns">,
        }
      : "skip",
  );

  const createEmail = useMutation(api.emails.createEmail);
  const updateCampaignStatus = useMutation(api.campaigns.updateCampaignStatus);
  const deleteCampaign = useMutation(api.campaigns.deleteCampaign);
  const updateCampaignAudiences = useMutation(
    api.campaigns.updateCampaignAudiences,
  ).withOptimisticUpdate((localStore, args) => {
    const { id: campaignId, audienceIds } = args;
    if (!campaignId) {
      console.error("Campaign ID is required");
      return;
    }

    // Update the campaign in the local store with new audience IDs
    const currentCampaign = localStore.getQuery(api.campaigns.getCampaign, {
      id: campaignId,
    });

    if (currentCampaign !== undefined) {
      const updatedCampaign = {
        ...currentCampaign,
        audienceIds: audienceIds,
        updatedAt: Date.now(),
      };

      localStore.setQuery(
        api.campaigns.getCampaign,
        { id: campaignId },
        updatedCampaign,
      );
    }
  });

  // Query all audiences for the multi-selector
  const [audienceSearch, setAudienceSearch] = useState("");

  const audiences = useQuery(api.audiences.getAllAudiences, {
    search: audienceSearch,
  });

  // Get selected audiences based on campaign's audienceIds
  const selectedAudiences = useMemo(() => {
    return (
      audiences?.filter((audience) =>
        campaign?.audienceIds?.includes(audience._id),
      ) || []
    );
  }, [audiences, campaign?.audienceIds]);

  const [loading, setLoading] = useState(false);
  const [campaignActionLoading, setCampaignActionLoading] = useState<
    string | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateEmailOrdering = useMutation(
    api.emails.updateEmail,
  ).withOptimisticUpdate((localStore, args) => {
    const { ordering: newOrdering, id: emailId, campaignId } = args;
    if (!campaignId || !newOrdering || !emailId) {
      console.error("Campaign ID, new ordering, and email ID are required");
      return;
    }
    const currentEmails = localStore.getQuery(api.emails.emailsList, {
      campaignId,
    });

    if (currentEmails !== undefined) {
      const updatedEmails = currentEmails
        .map((email) =>
          email._id === emailId ? { ...email, ordering: newOrdering } : email,
        )
        .sort((a, b) => {
          return a.ordering - b.ordering;
        });

      localStore.setQuery(api.emails.emailsList, { campaignId }, updatedEmails);
    }
  });

  const handleReorder = useCallback(
    (newOrder: Email[]) => {
      Promise.all(
        newOrder.map((email, index) => {
          const newOrdering = index + 1;
          if (email.ordering !== newOrdering) {
            return updateEmailOrdering({
              id: email._id,
              ordering: newOrdering,
              campaignId: campaignId as Id<"campaigns">,
            });
          }
        }),
      );
    },
    [campaignId, updateEmailOrdering],
  );

  const handleAddEmail = useCallback(() => {
    setLoading(true);
    createEmail({
      campaignId: campaignId as Id<"campaigns">,
      subject: "New Email",
      body: "",
      delay: 1,
      delayUnit: "days",
      ordering: (emails?.length ?? 0) + 1,
    }).finally(() => {
      setLoading(false);
      toast.success("Email created successfully");
    });
  }, [campaignId, createEmail, emails?.length]);

  const handleCampaignAction = useCallback(
    async (action: string) => {
      if (!campaignId) return;
      setCampaignActionLoading(action);
      try {
        switch (action) {
          case "publish": {
            if (!selectedAudiences.length) {
              toast.warning(
                "Please select at least one audience before publishing",
              );
              return;
            }
            const audienceIds = selectedAudiences.map(
              (audience: { _id: string; name: string; description?: string }) =>
                audience._id as Id<"audiences">,
            );
            await updateCampaignStatus({
              id: campaignId as Id<"campaigns">,
              action: "publish",
              audienceIds,
            });
            toast.success("Campaign published successfully");
            break;
          }
          case "pause":
            await updateCampaignStatus({
              id: campaignId as Id<"campaigns">,
              action: "pause",
            });
            toast.success("Campaign paused successfully");
            break;
          case "resume":
            await updateCampaignStatus({
              id: campaignId as Id<"campaigns">,
              action: "resume",
            });
            toast.success("Campaign resumed successfully");
            break;
          case "delete":
            setDeleteDialogOpen(true);
            break;
        }
      } catch (error) {
        toast.error(`Failed to ${action} campaign`);
        console.error(`Error ${action}ing campaign:`, error);
      } finally {
        setCampaignActionLoading(null);
      }
    },
    [campaignId, updateCampaignStatus, selectedAudiences],
  );

  const handleAudienceSelection = useCallback(
    (selected: { _id: string; name: string; description?: string }[]) => {
      if (!campaignId || !campaign || campaign.status !== "draft") return;

      const audienceIds = selected.map(
        (audience: { _id: string; name: string; description?: string }) =>
          audience._id as Id<"audiences">,
      );

      // Use optimistic update - no need for try/catch or loading states
      updateCampaignAudiences({
        id: campaignId as Id<"campaigns">,
        audienceIds,
      }).catch((error) => {
        // Only show error if the optimistic update fails on the server
        toast.error("Failed to update audience selection");
        console.error("Error updating audiences:", error);
      });
    },
    [campaignId, campaign, updateCampaignAudiences],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!campaignId) return;

    setCampaignActionLoading("delete");
    try {
      await deleteCampaign({ id: campaignId as Id<"campaigns"> });
      toast.success("Campaign deleted successfully");
      setDeleteDialogOpen(false);
      // Redirect to campaigns list after deletion
      navigate("/app/campaigns");
    } catch (error) {
      toast.error("Failed to delete campaign");
      console.error("Error deleting campaign:", error);
    } finally {
      setCampaignActionLoading(null);
    }
  }, [campaignId, deleteCampaign, navigate]);

  return (
    <>
      <div className="mx-16 mt-4">
        <Link
          to="/app/campaigns"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Go back to campaigns</span>
        </Link>
      </div>
      <div className="w-full max-w-4xl mx-auto p-6">
        {/* Campaign Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl space-x-2 font-bold text-foreground mb-2">
                <span>{campaign?.name || "Email Campaign Flow"}</span>
                {campaign && (
                  <StatusBadge status={campaign.status} type="campaign" />
                )}
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">
                  Manage your email campaign sequence and analytics
                </p>
              </div>
            </div>
          </div>

          {/* Audience Selection and Display */}
          {campaign && (
            <div className="mb-6 border-border/80 border bg-muted/30 py-3 px-3 rounded-md">
              <label className="block text-base mb-2 font-medium text-foreground">
                {campaign.status === "draft"
                  ? "Select Audiences"
                  : "Target Audiences"}
              </label>

              {campaign.status === "draft" ? (
                <>
                  <MultiSelector
                    options={audiences || []}
                    selectedOptions={selectedAudiences}
                    onSelectionChange={handleAudienceSelection}
                    placeholder="Search and select audiences..."
                    searchValue={audienceSearch}
                    onSearchChange={setAudienceSearch}
                    loading={!audiences}
                    className="w-full"
                  />
                  <p className="text-xs pt-2 text-muted-foreground mt-1">
                    Select one or more audiences to target with this campaign
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  {selectedAudiences.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedAudiences.map(
                        (audience: {
                          _id: string;
                          name: string;
                          description?: string;
                        }) => (
                          <Badge
                            key={audience._id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <span>{audience.name}</span>
                          </Badge>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No audiences selected
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Campaign is targeting {selectedAudiences.length} audience
                    {selectedAudiences.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Campaign Control Buttons */}
          {campaign && (
            <div className="flex flex-wrap gap-2 mb-6">
              {campaign.status === "draft" && (
                <Button
                  onClick={() => handleCampaignAction("publish")}
                  disabled={campaignActionLoading === "publish"}
                  className="bg-primary cursor-pointer hover:bg-primary/90 text-primary-foreground"
                >
                  {campaignActionLoading === "publish" ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Publish Campaign
                    </>
                  )}
                </Button>
              )}

              {campaign.status === "active" && (
                <Button
                  onClick={() => handleCampaignAction("pause")}
                  disabled={campaignActionLoading === "pause"}
                  variant="secondary"
                  className="cursor-pointer"
                >
                  {campaignActionLoading === "pause" ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Pausing...
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Campaign
                    </>
                  )}
                </Button>
              )}

              {campaign.status === "paused" && (
                <Button
                  onClick={() => handleCampaignAction("resume")}
                  disabled={campaignActionLoading === "resume"}
                  className="bg-accent cursor-pointer hover:bg-accent/90 text-accent-foreground"
                >
                  {campaignActionLoading === "resume" ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Resuming...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Resume Campaign
                    </>
                  )}
                </Button>
              )}

              {(campaign.status === "completed" ||
                campaign.status === "paused") && (
                <Button
                  onClick={() => handleCampaignAction("delete")}
                  disabled={campaignActionLoading === "delete"}
                  className="hover:bg-destructive cursor-pointer"
                  variant="ghost"
                >
                  {campaignActionLoading === "delete" ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Campaign
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {!emails || !campaign ? (
          <>
            <LoadingSpinner className="w-8 h-8 mx-auto accent-foreground" />
            <p className="text-center text-muted-foreground mt-4">
              Loading campaign...
            </p>
          </>
        ) : (
          <Tabs defaultValue="sequence" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sequence">Sequence</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="sequence" className="mt-6">
              <div className="w-full max-w-2xl mx-auto">
                <div className="mb-4">
                  <p className="text-muted-foreground text-center">
                    Drag and drop to reorder your email sequence
                  </p>
                </div>

                <div className="relative">
                  <ParticleLine count={emails.length} />

                  <Reorder.Group
                    axis="y"
                    values={emails}
                    onReorder={handleReorder}
                    className="space-y-8"
                  >
                    <AnimatePresence>
                      {emails.map((email) => (
                        <EmailCard key={email._id} email={email} />
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                </div>

                <div className="flex items-center justify-center w-full my-6">
                  <Button
                    onClick={handleAddEmail}
                    disabled={
                      loading ||
                      (campaign && campaign.status === "completed") ||
                      campaign.status === "active"
                    }
                    className="cursor-pointer bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Creating email...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              {campaign &&
              (campaign.status === "active" ||
                campaign.status === "paused" ||
                campaign.status === "completed") ? (
                <div className="w-full">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">
                      Email Scheduling Status
                    </h3>
                    <p className="text-muted-foreground">
                      Track the status and progress of your campaign's scheduled
                      emails
                    </p>
                  </div>
                  <CampaignSchedulingStatus
                    campaignId={campaignId as Id<"campaigns">}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No Analytics Available
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Analytics will be available once your campaign is
                      published and active.
                      {campaign?.status === "draft" &&
                        " Publish your campaign to start tracking email performance."}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        itemName={campaign?.name}
        loading={campaignActionLoading === "delete"}
        description="This will permanently delete the campaign and all associated emails. This action cannot be undone."
      />
    </>
  );
}
