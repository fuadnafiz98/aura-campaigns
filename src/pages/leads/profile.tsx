import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
import {
  ArrowLeft,
  Mail,
  Building,
  Tag,
  Calendar,
  User,
  History,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FollowUpEmailDialog } from "@/components/modals/leads/follow-up-email";
import { useState } from "react";

export default function LeadProfilePage() {
  const { leadId } = useParams<{ leadId: Id<"leads"> }>();
  const navigate = useNavigate();

  const lead = useQuery(api.leads.getLead, leadId ? { id: leadId } : "skip");

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent mx-auto rounded-full animate-spin mb-4"></div>
          <span className="text-muted-foreground text-base font-medium">
            Loading lead profile...
          </span>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Extract first name and last name from the full name
  const nameParts = lead.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Lead Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Detailed information about this lead
            </p>
          </div>
        </div>

        {/* Main Profile Card */}
        <Card className="glass-2 border-border">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-brand/10 flex items-center justify-center border border-border/50">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-brand rounded-lg flex items-center justify-center text-primary-foreground text-lg font-bold">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              {/* Name and basic info */}
              <div className="flex-1 space-y-1">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {lead.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {firstName && lastName
                      ? `${firstName} ${lastName}`
                      : lead.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-brand/10 text-brand border-brand/20 px-2 py-0.5"
                  >
                    <Tag className="w-2.5 h-2.5 mr-1" />
                    {lead.category}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-3 h-3 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-muted-foreground text-sm">
                    Email Address
                  </h3>
                </div>
                <div className="ml-8">
                  <p className="text-foreground font-medium text-sm">
                    {lead.email}
                  </p>
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Building className="w-3 h-3 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-muted-foreground text-sm">
                    Company
                  </h3>
                </div>
                <div className="ml-8">
                  <p className="text-foreground font-medium text-sm">
                    {lead.company}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Tag className="w-3 h-3 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-muted-foreground text-sm">
                    Category
                  </h3>
                </div>
                <div className="ml-8">
                  <p className="text-foreground font-medium text-sm">
                    {lead.category}
                  </p>
                </div>
              </div>

              {/* Import Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-muted-foreground text-sm">
                    Added
                  </h3>
                </div>
                <div className="ml-8">
                  <p className="text-foreground font-medium text-sm">
                    {formatDate(lead.imported_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Summary */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-primary" />
                </div>
                Contact Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-card/50 border border-border rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">
                    {firstName || "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    First Name
                  </div>
                </div>
                <div className="bg-card/50 border border-border rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">
                    {lastName || "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">Last Name</div>
                </div>
                <div className="bg-card/50 border border-border rounded-lg p-3">
                  <div className="text-lg font-bold text-primary">Active</div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Logs Section */}
        {leadId && <EmailLogsSection leadId={leadId} lead={lead} />}
      </div>
    </div>
  );
}

// Email Logs Section Component
function EmailLogsSection({
  leadId,
  lead,
}: {
  leadId: Id<"leads">;
  lead: any;
}) {
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedEmailLog, setSelectedEmailLog] = useState<any>(null);
  const emailLogs = useQuery(api.emailLogs.getLeadEmailLogs, {
    leadId,
    limit: 20,
  });

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "delivered":
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "bounced":
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "opened":
        return <Mail className="w-4 h-4 text-blue-500" />;
      case "clicked":
        return <ExternalLink className="w-4 h-4 text-purple-500" />;
      case "queued":
      case "scheduled":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "delivered":
      case "sent":
        return (
          <Badge
            variant="default"
            className="bg-green-500/10 text-green-600 border-green-500/20"
          >
            {status}
          </Badge>
        );
      case "bounced":
      case "failed":
        return (
          <Badge
            variant="destructive"
            className="bg-red-500/10 text-red-600 border-red-500/20"
          >
            {status}
          </Badge>
        );
      case "opened":
        return (
          <Badge
            variant="default"
            className="bg-blue-500/10 text-blue-600 border-blue-500/20"
          >
            {status}
          </Badge>
        );
      case "clicked":
        return (
          <Badge
            variant="default"
            className="bg-purple-500/10 text-purple-600 border-purple-500/20"
          >
            {status}
          </Badge>
        );
      case "queued":
      case "scheduled":
        return (
          <Badge
            variant="secondary"
            className="bg-orange-500/10 text-orange-600 border-orange-500/20"
          >
            {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!emailLogs) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent mx-auto rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Email History
          <Badge variant="secondary" className="ml-auto">
            {emailLogs.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {emailLogs.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No emails sent to this lead yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {emailLogs.map((log) => (
              <div
                key={log._id}
                className="flex items-start gap-4 p-4 bg-card/50 border border-border rounded-lg hover:bg-card/70 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(log.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {log.subject || "No subject"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {log.campaign && (
                          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            Campaign: {log.campaign.name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmailLog(log);
                          setIsFollowUpModalOpen(true);
                        }}
                        className="h-7 px-2 text-xs bg-background hover:bg-muted"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Follow Up
                      </Button>
                    </div>
                  </div>

                  {log.errorMessage && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded">
                      {log.errorMessage}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Follow Up Email Modal */}
      {lead && (
        <FollowUpEmailDialog
          leadEmail={lead.email}
          leadName={lead.name}
          leadId={leadId}
          isOpen={isFollowUpModalOpen}
          onOpenChange={(open) => {
            setIsFollowUpModalOpen(open);
            if (!open) setSelectedEmailLog(null);
          }}
          contextSubject={selectedEmailLog?.subject}
        />
      )}
    </Card>
  );
}
