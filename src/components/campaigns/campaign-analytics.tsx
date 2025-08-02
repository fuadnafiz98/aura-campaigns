import React from "react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Activity, TrendingUp } from "lucide-react";
import { MailCheckIcon } from "@/components/ui/mail-check";
import { ClockIcon } from "@/components/ui/clock";
import { BadgeAlertIcon } from "@/components/ui/badge-alert";
import { GaugeIcon } from "@/components/ui/gauge";
import {
  AnimatedStatCard,
  StatusItem,
  SuccessRateRing,
} from "@/components/animations";

interface CampaignSchedulingStatusProps {
  campaignId: Id<"campaigns">;
}

export const CampaignSchedulingStatus: React.FC<
  CampaignSchedulingStatusProps
> = ({ campaignId }) => {
  const emailLogs = useQuery(api.emailLogs.getCampaignEmailLogs, {
    campaignId,
  });

  const emailStats = useQuery(api.emailLogs.getCampaignEmailStats, {
    campaignId,
  });

  if (!emailLogs || !emailStats) {
    return (
      <div className="min-h-[400px] bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent mx-auto rounded-full animate-spin mb-4"></div>
          <span className="text-muted-foreground text-base font-medium">
            Loading campaign analytics...
          </span>
        </div>
      </div>
    );
  }

  const nextScheduledEmail = emailLogs
    .filter((log) => log.status === "queued" || log.status === "scheduled")
    .sort((a, b) => a.createdAt - b.createdAt)[0];

  const deliveryRate =
    emailStats.total > 0 ? (emailStats.delivered / emailStats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid - Compact Row Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Total"
          value={emailStats.total}
          subtitle="Sent"
          icon={GaugeIcon}
          iconColor="bg-primary/20 text-primary"
          gradientFrom="from-primary/20"
        />

        <AnimatedStatCard
          title="Delivered"
          value={emailStats.delivered}
          subtitle={`${Math.round((emailStats.delivered / emailStats.total) * 100 || 0)}%`}
          icon={MailCheckIcon}
          iconColor="bg-emerald-500/10 text-emerald-400"
          gradientFrom="from-emerald-500/5"
          showProgressRing
          progress={(emailStats.delivered / emailStats.total) * 100 || 0}
          progressColor="rgb(52, 211, 153)"
        />

        <AnimatedStatCard
          title="Clicks"
          value={emailStats.clicked}
          subtitle={`${Math.round((emailStats.clicked / emailStats.total) * 100 || 0)}%`}
          icon={ClockIcon}
          iconColor="bg-blue-500/10 text-blue-400"
          gradientFrom="from-blue-500/5"
          showProgressRing
          progress={(emailStats.clicked / emailStats.total) * 100 || 0}
          progressColor="rgb(59, 130, 246)"
        />

        <AnimatedStatCard
          title="Failed"
          value={emailStats.failed}
          subtitle={`${Math.round((emailStats.failed / emailStats.total) * 100 || 0)}%`}
          icon={BadgeAlertIcon}
          iconColor="bg-red-500/10 text-red-400"
          gradientFrom="from-red-500/5"
          showProgressRing
          progress={(emailStats.failed / emailStats.total) * 100 || 0}
          progressColor="rgb(239, 68, 68)"
        />
      </div>

      {/* Next Scheduled Email */}
      {nextScheduledEmail && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Next Scheduled Email
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {nextScheduledEmail.subject || "Email"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {nextScheduledEmail.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>To: {nextScheduledEmail.to || "Unknown"}</span>
                <span>
                  {new Date(nextScheduledEmail.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Section */}
      {emailStats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Delivery Performance Card */}
          <Card className="bg-card border-border col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Campaign Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="grid grid-cols-2 gap-4 my-4">
                <SuccessRateRing progress={deliveryRate} />

                <div className="space-y-3">
                  {[
                    {
                      label: "Total",
                      value: emailStats.total,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Delivered",
                      value: emailStats.delivered || 0,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Clicked",
                      value: emailStats.clicked || 0,
                      color: "bg-cyan-500",
                    },
                    {
                      label: "Failed",
                      value: emailStats.failed || 0,
                      color: "bg-purple-500",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${item.color} rounded-full`} />
                        <span className="text-xs text-muted-foreground">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Overview Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {[
                  {
                    label: "Total",
                    value: emailStats.total,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Delivered",
                    value: emailStats.delivered || 0,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Clicked",
                    value: emailStats.clicked || 0,
                    color: "bg-cyan-500",
                  },
                  {
                    label: "Failed",
                    value: emailStats.failed || 0,
                    color: "bg-red-500",
                  },
                ].map((item) => {
                  const progress =
                    emailStats.total > 0
                      ? (item.value / emailStats.total) * 100
                      : 0;

                  return (
                    <StatusItem
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      color={item.color}
                      progress={progress}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Scheduled Jobs Message */}
      {emailStats.total === 0 && (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-2">
              No Scheduled Emails
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your campaign doesn't have any scheduled emails yet. Emails will
              appear here once your campaign is active and starts scheduling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
