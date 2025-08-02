import React from "react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  AlertTriangle,
  Mail,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignSchedulingStatusProps {
  campaignId: Id<"campaigns">;
}

const getStatusConfig = (status: string) => {
  const statusMap: Record<
    string,
    {
      color: string;
      icon: React.ReactNode;
      label: string;
    }
  > = {
    scheduled: {
      color:
        "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      icon: <Calendar className="w-3 h-3" />,
      label: "Scheduled",
    },
    cancelled: {
      color:
        "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
      icon: <Pause className="w-3 h-3" />,
      label: "Cancelled",
    },
    sent: {
      color:
        "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Sent",
    },
    failed: {
      color: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
      icon: <XCircle className="w-3 h-3" />,
      label: "Failed",
    },
  };

  return (
    statusMap[status] || {
      color:
        "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
      icon: <AlertTriangle className="w-3 h-3" />,
      label: "Unknown",
    }
  );
};

export const CampaignSchedulingStatus: React.FC<
  CampaignSchedulingStatusProps
> = ({ campaignId }) => {
  const scheduledJobs = useQuery(api.scheduledEmails.getCampaignScheduledJobs, {
    campaignId,
  });

  const emailStats = useQuery(api.emailLogs.getCampaignEmailStats, {
    campaignId,
  });

  if (!scheduledJobs) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
              Loading scheduling status...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = scheduledJobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalJobs = scheduledJobs.length;
  const nextScheduledJob = scheduledJobs
    .filter((job) => job.status === "scheduled")
    .sort((a, b) => a.scheduledAt - b.scheduledAt)[0];

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xl font-bold">{totalJobs}</div>
                <div className="text-xs text-muted-foreground">
                  Total Scheduled
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-xl font-bold">{emailStats?.sent || 0}</div>
                <div className="text-xs text-muted-foreground">Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-xl font-bold">
                  {statusCounts.scheduled || 0}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <div>
                <div className="text-xl font-bold">
                  {statusCounts.failed || 0}
                </div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Scheduled Email */}
      {nextScheduledJob && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Next Scheduled Email
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {nextScheduledJob.email?.subject || "Email"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {nextScheduledJob.email?.delay}{" "}
                  {nextScheduledJob.email?.delayUnit}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>To: {nextScheduledJob.lead?.name || "Unknown"}</span>
                <span>
                  {new Date(nextScheduledJob.scheduledAt).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Breakdown */}
      {totalJobs > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Scheduling Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(statusCounts).map(([status, count]) => {
                const config = getStatusConfig(status);
                const percentage = Math.round((count / totalJobs) * 100);

                return (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", config.color)}
                      >
                        {config.icon}
                        <span className="ml-1">{config.label}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{count}</span>
                      <span className="text-muted-foreground">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Scheduled Jobs Message */}
      {totalJobs === 0 && (
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto" />
              <div className="text-sm font-medium">No Scheduled Emails</div>
              <div className="text-xs text-muted-foreground">
                Publish your campaign to start scheduling emails
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
