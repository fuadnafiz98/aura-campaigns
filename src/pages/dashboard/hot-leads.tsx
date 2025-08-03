import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const HotLeadsTab = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Get campaigns for the dropdown filter
  const campaigns = useQuery(api.campaigns.getCampaigns, {
    paginationOpts: { numItems: 100, cursor: null },
  });

  // TODO: Get email logs with lead information for hot leads analysis
  // const emailLogs = useQuery(api.emailLogs.listEmailLogs, { limit: 100 });

  // Mock data for hot leads with the new structure - this will be replaced with actual data
  const hotLeads = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@techcorp.com",
      lastActivity: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      lastEvent: "clicked",
      campaignName: "Product Launch 2024",
      avatarUrl: null,
      temperature: "hot",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@innovate.co",
      lastActivity: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
      lastEvent: "opened",
      campaignName: "Summer Sale Campaign",
      avatarUrl: null,
      temperature: "hot",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily@startup.io",
      lastActivity: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      lastEvent: "opened",
      campaignName: "Newsletter Q4",
      avatarUrl: null,
      temperature: "warm",
    },
  ];

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
        label: event,
      }
    );
  };

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

  // Filter leads based on selected campaign
  const filteredLeads =
    selectedCampaign === "all"
      ? hotLeads
      : hotLeads.filter((lead) => lead.campaignName === selectedCampaign);

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
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg font-semibold text-foreground">
            Priority Leads
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Leads with recent email engagement requiring immediate attention
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted/20 text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Temperature</div>
            <div className="col-span-3">Campaign</div>
            <div className="col-span-2">Last Activity</div>
            <div className="col-span-2">Last Activity Time</div>
          </div>

          {/* Leads List */}
          <div className="divide-y divide-border">
            {filteredLeads.map((lead) => {
              const eventConfig = getEventConfig(lead.lastEvent);
              const tempConfig = getTemperatureConfig(lead.temperature);
              return (
                <div
                  key={lead.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group cursor-pointer items-center"
                >
                  {/* Name and Email */}
                  <div className="col-span-3 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-foreground/15 to-background rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0">
                      {lead.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {lead.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.email}
                      </p>
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

                  {/* Campaign Name */}
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-foreground truncate">
                      {lead.campaignName}
                    </p>
                  </div>

                  {/* Last Activity (Event) */}
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

                  {/* Last Activity Time */}
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-foreground">
                      {formatRelativeTime(lead.lastActivity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLeads.length === 0 && (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HotLeadsTab;
