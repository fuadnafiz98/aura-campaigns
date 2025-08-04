import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Flame,
  Filter,
  Mail,
  MousePointer,
  Eye,
  Activity,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Id } from "#/_generated/dataModel";

const LeadActivityDisplay = ({
  leadId,
  campaignId,
}: {
  leadId: Id<"leads">;
  campaignId?: Id<"campaigns">;
}) => {
  const activity = useQuery(api.leadScoring.getLeadLatestActivity, {
    leadId,
    ...(campaignId && { campaignId }),
  });

  const getEventConfig = (event: string) => {
    const eventMap: Record<
      string,
      {
        badge: string;
        icon: React.ReactNode;
        label: string;
      }
    > = {
      clicked: {
        badge:
          "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
        icon: <MousePointer className="w-3.5 h-3.5" />,
        label: "Clicked",
      },
      opened: {
        badge:
          "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
        icon: <Eye className="w-3.5 h-3.5" />,
        label: "Opened",
      },
      delivered: {
        badge:
          "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
        icon: <Mail className="w-3.5 h-3.5" />,
        label: "Delivered",
      },
      sent: {
        badge:
          "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
        icon: <Activity className="w-3.5 h-3.5" />,
        label: "Sent",
      },
    };

    return (
      eventMap[event] || {
        badge:
          "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
        icon: <Activity className="w-3.5 h-3.5" />,
        label: event || "No activity",
      }
    );
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!activity) {
    return (
      <>
        <div className="col-span-2">
          <div className="animate-pulse bg-muted h-5 w-16 rounded"></div>
        </div>
        <div className="col-span-2">
          <div className="animate-pulse bg-muted h-4 w-12 rounded"></div>
        </div>
        <div className="col-span-1">
          <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>
        </div>
      </>
    );
  }

  if (!activity.hasActivity) {
    return (
      <>
        <div className="col-span-2">
          <Badge className="bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 font-medium flex items-center gap-1.5 px-2 py-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-xs">No activity</span>
          </Badge>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-muted-foreground">-</p>
        </div>
        <div className="col-span-1">
          <p className="text-sm font-medium text-muted-foreground">-</p>
        </div>
      </>
    );
  }

  const eventConfig = getEventConfig(activity.latestActivityType || "");

  return (
    <>
      <div className="col-span-2">
        <Badge
          className={cn(
            "font-medium flex items-center gap-1.5 px-2 py-1",
            eventConfig.badge,
          )}
        >
          {eventConfig.icon}
          <span className="text-xs">{eventConfig.label}</span>
        </Badge>
      </div>
      <div className="col-span-2">
        <p className="text-sm font-medium text-foreground">
          {activity.latestActivityTime && activity.latestActivityTime > 0
            ? formatRelativeTime(activity.latestActivityTime)
            : "-"}
        </p>
      </div>
      <div className="col-span-1">
        <p className="text-sm font-medium text-foreground truncate">
          {activity.campaignName || "-"}
        </p>
      </div>
    </>
  );
};

const HotLeadsTab = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Get campaigns for the dropdown filter
  const campaigns = useQuery(api.campaigns.getCampaigns, {
    paginationOpts: { numItems: 100, cursor: null },
  });

  // Get the selected campaign ID
  const selectedCampaignId =
    selectedCampaign !== "all"
      ? campaigns?.page?.find((c) => c.name === selectedCampaign)?._id
      : undefined;

  // Get hot leads using the lead scoring system
  const hotLeadsData = useQuery(api.leadScoring.getHotLeads, {
    limit: 50,
    ...(selectedCampaignId && { campaignId: selectedCampaignId }),
  });

  // Transform the data to match the expected format
  const hotLeads =
    hotLeadsData?.map((lead) => ({
      id: lead._id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      category: lead.category,
      temperature: lead.temperature,
      score: lead.score,
    })) || [];

  const getTemperatureConfig = (temperature: string) => {
    const tempMap: Record<
      string,
      {
        badge: string;
        icon: React.ReactNode;
        label: string;
      }
    > = {
      hot: {
        badge:
          "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
        icon: <Flame className="w-3.5 h-3.5" />,
        label: "Hot",
      },
      warm: {
        badge:
          "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
        icon: <Activity className="w-3.5 h-3.5" />,
        label: "Warm",
      },
      cold: {
        badge:
          "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
        icon: <Activity className="w-3.5 h-3.5" />,
        label: "Cold",
      },
    };

    return (
      tempMap[temperature] || {
        badge:
          "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
        icon: <Activity className="w-3.5 h-3.5" />,
        label: temperature,
      }
    );
  };

  // Filter leads based on selected campaign (already handled in query)
  const filteredLeads = hotLeads;

  // Filter campaigns based on search
  const filteredCampaigns =
    campaigns?.page?.filter((campaign) =>
      campaign.name.toLowerCase().includes(searchValue.toLowerCase()),
    ) || [];

  const selectedCampaignName =
    selectedCampaign === "all"
      ? "All Campaigns"
      : campaigns?.page?.find((c) => c.name === selectedCampaign)?.name ||
        selectedCampaign;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Hot Leads</h2>
            <p className="text-muted-foreground">
              High-priority leads ready for immediate action
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[250px] justify-between"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {selectedCampaignName}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <div className="p-2">
                  <Input
                    placeholder="Search campaigns..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="max-h-60 overflow-auto">
                  <div
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      selectedCampaign === "all" &&
                        "bg-accent text-accent-foreground",
                    )}
                    onClick={() => {
                      setSelectedCampaign("all");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCampaign === "all"
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    All Campaigns
                  </div>
                  {filteredCampaigns.map((campaign) => (
                    <div
                      key={campaign._id}
                      className={cn(
                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        selectedCampaign === campaign.name &&
                          "bg-accent text-accent-foreground",
                      )}
                      onClick={() => {
                        setSelectedCampaign(campaign.name);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCampaign === campaign.name
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {campaign.name}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Hot Leads List */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted/20 text-sm font-medium text-muted-foreground">
            <div className="col-span-4">Name</div>
            <div className="col-span-1">Score</div>
            <div className="col-span-2">Temperature</div>
            <div className="col-span-2">Last Activity</div>
            <div className="col-span-2">Activity Time</div>
            <div className="col-span-1">Campaign</div>
          </div>

          {/* Leads List */}
          <div className="divide-y divide-border">
            {!hotLeadsData ? (
              // Loading state
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-muted-foreground animate-pulse" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Loading hot leads...
                </h3>
                <p className="text-muted-foreground">
                  Analyzing email engagement data
                </p>
              </div>
            ) : filteredLeads.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {selectedCampaign === "all"
                    ? "No hot leads found"
                    : "No leads found for this campaign"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedCampaign === "all"
                    ? "Start by importing leads or creating new ones"
                    : "Try selecting a different campaign or add new leads"}
                </p>
              </div>
            ) : (
              // Leads data
              filteredLeads.map((lead) => {
                const tempConfig = getTemperatureConfig(lead.temperature);
                return (
                  <div
                    key={lead.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group cursor-pointer items-center"
                  >
                    {/* Name and Email */}
                    <div className="col-span-4 flex items-center space-x-3">
                      <Link to={`/app/leads/${lead.id}`}>
                        <div className="w-8 h-8 bg-gradient-to-br from-foreground/15 to-background rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0">
                          {lead.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      </Link>
                      <Link to={`/app/leads/${lead.id}`}>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {lead.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {lead.email}
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Score */}
                    <div className="col-span-1">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-foreground">
                          {lead.score || 0}
                        </span>
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="col-span-2">
                      <Badge
                        className={cn(
                          "font-medium flex items-center gap-1.5 px-2 py-1",
                          tempConfig.badge,
                        )}
                      >
                        {tempConfig.icon}
                        <span className="text-xs">{tempConfig.label}</span>
                      </Badge>
                    </div>

                    {/* Latest Activity, Activity Time, and Campaign - Using the new component */}
                    <LeadActivityDisplay
                      leadId={lead.id}
                      campaignId={selectedCampaignId}
                    />
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotLeadsTab;
