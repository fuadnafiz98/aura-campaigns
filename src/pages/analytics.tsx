import React from "react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";
import { MailCheckIcon } from "@/components/ui/mail-check";
import { ClockIcon } from "@/components/ui/clock";
import { BadgeAlertIcon } from "@/components/ui/badge-alert";
import { CircleCheckIcon } from "@/components/ui/circle-check";
import { GaugeIcon } from "@/components/ui/gauge";
import {
  AnimatedStatCard,
  StatusItem,
  SuccessRateRing,
} from "@/components/animations";

export const AnalyticsPage = () => {
  const emailStats = useQuery(api.emailLogs.getEmailLogsStats);

  if (!emailStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent mx-auto rounded-full animate-spin mb-4"></div>
          <span className="text-muted-foreground text-base font-medium">
            Loading analytics...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Email Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and track your email delivery performance with real-time
              insights
            </p>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <AnimatedStatCard
            title="Total Emails"
            value={emailStats.total}
            subtitle="All time"
            icon={GaugeIcon}
            iconColor="bg-primary/20 text-emerald-300"
            gradientFrom="from-primary/20"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">All time</span>
              </div>
            </div>
          </AnimatedStatCard>

          <AnimatedStatCard
            title="Delivered"
            value={emailStats.delivered}
            subtitle={
              emailStats.total > 0
                ? `${Math.round((emailStats.delivered / emailStats.total) * 100)}% success rate`
                : "No data"
            }
            icon={MailCheckIcon}
            iconColor="bg-emerald-500/10 text-emerald-400"
            gradientFrom="from-emerald-500/5"
            showProgressRing
            progress={
              emailStats.total > 0
                ? (emailStats.delivered / emailStats.total) * 100
                : 0
            }
            progressColor="rgb(52, 211, 153)"
          />

          <AnimatedStatCard
            title="Sent"
            value={emailStats.sent}
            subtitle={
              emailStats.total > 0
                ? `${Math.round((emailStats.sent / emailStats.total) * 100)}% of total`
                : "No data"
            }
            icon={CircleCheckIcon}
            iconColor="bg-blue-500/10 text-blue-400"
            gradientFrom="from-blue-500/5"
            showProgressRing
            progress={
              emailStats.total > 0
                ? (emailStats.sent / emailStats.total) * 100
                : 0
            }
            progressColor="rgb(59, 130, 246)"
          />

          <AnimatedStatCard
            title="Failed/Bounced"
            value={emailStats.failed + emailStats.bounced}
            subtitle={
              emailStats.total > 0
                ? `${Math.round(((emailStats.failed + emailStats.bounced) / emailStats.total) * 100)}% failure rate`
                : "No data"
            }
            icon={BadgeAlertIcon}
            iconColor="bg-red-500/10 text-red-400"
            gradientFrom="from-red-500/5"
            showProgressRing
            progress={
              emailStats.total > 0
                ? ((emailStats.failed + emailStats.bounced) /
                    emailStats.total) *
                  100
                : 0
            }
            progressColor="rgb(239, 68, 68)"
          />

          <AnimatedStatCard
            title="Pending"
            value={emailStats.pending}
            subtitle={emailStats.pending > 0 ? "Processing..." : "In queue"}
            icon={ClockIcon}
            iconColor="bg-amber-500/10 text-amber-400"
            gradientFrom="from-amber-500/5"
            showProgressRing
            progress={
              emailStats.total > 0
                ? (emailStats.pending / emailStats.total) * 100
                : 0
            }
            progressColor="rgb(245, 158, 11)"
          />
        </div>

        {/* Detailed Analytics Section */}
        {emailStats.total > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Delivery Performance Card */}
            <Card className="bg-card border-border col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Delivery Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8">
                <div className="grid grid-cols-2 gap-6 my-8">
                  <SuccessRateRing
                    progress={
                      emailStats.total > 0
                        ? (emailStats.delivered / emailStats.total) * 100
                        : 0
                    }
                  />

                  <div className="space-y-4">
                    {[
                      {
                        label: "Delivered",
                        value: emailStats.delivered,
                        color: "bg-emerald-500",
                      },
                      {
                        label: "Sent",
                        value: emailStats.sent,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Opened",
                        value: emailStats.opened,
                        color: "bg-cyan-500",
                      },
                      {
                        label: "Clicked",
                        value: emailStats.clicked,
                        color: "bg-purple-500",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 ${item.color} rounded-full`}
                          />
                          <span className="text-sm text-muted-foreground">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
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
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: "Delivered",
                      value: emailStats.delivered,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Sent",
                      value: emailStats.sent,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Failed",
                      value: emailStats.failed,
                      color: "bg-red-500",
                    },
                    {
                      label: "Bounced",
                      value: emailStats.bounced,
                      color: "bg-orange-500",
                    },
                    {
                      label: "Pending",
                      value: emailStats.pending,
                      color: "bg-amber-500",
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
      </div>
    </div>
  );
};

export default AnalyticsPage;
