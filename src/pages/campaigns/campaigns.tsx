import { useState, useCallback } from "react";
import { Reorder, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleLine } from "@/components/animations/partical-line";
import { EmailCard } from "@/components/campaigns/email-card";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Doc, Id } from "#/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type Email = Doc<"emails">;

export default function EmailCampaignFlow() {
  const { campaignId } = useParams();
  const emails = useQuery(
    api.emails.emailsList,
    campaignId
      ? {
          campaignId: campaignId as Id<"campaigns">,
        }
      : "skip",
  );

  const createEmail = useMutation(api.emails.createEmail);

  const [loading, setLoading] = useState(false);

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

  // const handleReorder = (newOrder: Email[]) => {
  //   newOrder.forEach((email, index) => {
  //     updateEmail({
  //       id: email._id,
  //       ordering: index + 1,
  //     });
  //   });
  // };

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

  if (!emails) {
    return <Skeleton className="m-4 max-w-full h-full" />;
  }

  return (
    <>
      <div className="mx-16 mt-4">
        <Link
          to="/campaigns"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Go back to campaigns</span>
        </Link>
      </div>
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Email Campaign Flow
          </h2>
          <p className="text-muted-foreground">
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
              {emails.map((email, index) => (
                <EmailCard key={email._id} email={email} index={index} />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        <div className="flex items-center justify-center w-full my-6">
          <Button
            onClick={handleAddEmail}
            disabled={loading}
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
    </>
  );
}
