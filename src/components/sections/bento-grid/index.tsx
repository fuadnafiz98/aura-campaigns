import {
  ArrowUpRight,
  Mail,
  BarChart3,
  Users,
  Target,
  Zap,
  GitBranch,
  ChartBarBigIcon,
  Flame,
  Activity,
  Check,
  Send,
  Shield,
  ChartSpline,
  MailCheckIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ParticleLine } from "@/components/animations/partical-line";

function CampaignBuilderVisual() {
  const emails = [
    { id: 1, subject: "Welcome Email", delay: "0 days", status: "delivered" },
    {
      id: 2,
      subject: "Product Introduction",
      delay: "3 days",
      status: "scheduled",
    },
    { id: 3, subject: "Followup", delay: "7 days", status: "scheduled" },
  ];

  return (
    <div className="min-h-[300px] w-full py-12">
      <div className="relative h-full w-full">
        <div className="bg-border/50 dark:bg-border/10 flex z-10 overflow-hidden p-2 absolute top-0 left-[50%] w-full max-w-[400px] -translate-x-[50%] translate-y-0 rounded-[56px] transition-all duration-1000 ease-in-out group-hover:-translate-y-16">
          <div className="flex w-full relative z-10 overflow-hidden shadow-2xl border border-border/70 dark:border-border/5 dark:border-t-border/15 rounded-[48px] max-w-[384px] bg-card">
            <div className="w-full h-[400px] p-6 flex flex-col gap-4">
              <h2 className="text-sm my-2">Email Sequence Builder </h2>
              <div className="relative h-full">
                <ParticleLine count={emails.length} />
                <div className="space-y-8 text-xs">
                  {emails.map((email) => (
                    <div key={email.id} className="relative">
                      {/* Delay Badge */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>{email.delay}</span>
                        </div>
                      </div>

                      {/* Email Card */}
                      <div className="relative bg-muted backdrop-blur-sm border border-border rounded-xl shadow-lg hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-colors duration-200">
                        <div className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                              <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground text-xs">
                                {email.subject}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    email.status === "delivered"
                                      ? "bg-green-500"
                                      : "bg-yellow-500"
                                  }`}
                                />
                                <span className="text-xs text-muted-foreground capitalize">
                                  {email.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* UPDATE */}
            </div>
          </div>
        </div>
        <div className="absolute w-full bottom-0 translate-y-20 scale-x-[1.2] opacity-70 transition-all duration-1000 group-hover:translate-y-8 group-hover:opacity-100">
          <div className="from-brand-foreground/50 to-brand-foreground/0 absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[512px] dark:opacity-100"></div>
          <div className="from-brand/30 to-brand-foreground/0 absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-200 rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[256px] dark:opacity-100"></div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  const statusData = [
    {
      label: "Sent",
      value: 412,
      color: "bg-blue-500",
      progress: 85,
    },
    {
      label: "Delivered",
      value: 324,
      color: "bg-emerald-500",
      progress: 78.5,
    },
    {
      label: "Failed",
      value: 8,
      color: "bg-red-500",
      progress: 1.9,
    },
    {
      label: "Bounced",
      value: 21,
      color: "bg-orange-500",
      progress: 5.1,
    },
    {
      label: "Pending",
      value: 59,
      color: "bg-amber-500",
      progress: 14.3,
    },
  ];

  return (
    <div className="min-h-[240px] w-full relative p-4">
      <div className="relative h-full w-full max-w-md mx-auto">
        <Card className="relative min-h-[240px] glass-1 border-border/50">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <ChartSpline className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Status Overview</span>
            </div>
            <div className="space-y-3">
              {statusData.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between">
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
                  <div className="w-full bg-muted/50 rounded-full h-1.5">
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HotLeadsVisual() {
  const hotLeads = [
    {
      name: "Sarah Chen",
      email: "sarah@techcorp.com",
      score: 92,
      temperature: "hot",
      activity: "Clicked",
      time: "2m ago",
    },
    {
      name: "Mike Johnson",
      email: "mike@startup.io",
      score: 87,
      temperature: "hot",
      activity: "Opened",
      time: "5m ago",
    },
    {
      name: "Lisa Wang",
      email: "lisa@growth.co",
      score: 84,
      temperature: "warm",
      activity: "Clicked",
      time: "1h ago",
    },
  ];

  const getTemperatureConfig = (temperature: string) => {
    const tempMap: Record<string, { color: string; icon: React.ReactNode }> = {
      hot: {
        color: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: <Flame className="w-3 h-3" />,
      },
      warm: {
        color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        icon: <Activity className="w-3 h-3" />,
      },
    };
    return tempMap[temperature] || tempMap.warm;
  };

  const getActivityConfig = (activity: string) => {
    const activityMap: Record<string, { color: string }> = {
      Clicked: { color: "bg-purple-500/10 text-purple-600" },
      Opened: { color: "bg-cyan-500/10 text-cyan-600" },
      Delivered: { color: "bg-emerald-500/10 text-emerald-600" },
    };
    return activityMap[activity] || activityMap.Delivered;
  };

  return (
    <div className="min-h-[280px] w-full relative p-4">
      <div className="relative h-full w-full">
        <Card className="relative min-h-[280px] glass-1 border-border/50">
          <div className="pt-2 px-4 pb-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Hot Leads</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b border-border/50">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2">Activity</div>
            </div>

            {/* Lead Rows */}
            <div className="space-y-2">
              {hotLeads.map((lead, index) => {
                const tempConfig = getTemperatureConfig(lead.temperature);
                const activityConfig = getActivityConfig(lead.activity);

                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 px-2 py-2 hover:bg-muted/30 rounded-lg transition-colors text-xs"
                  >
                    {/* Name & Email */}
                    <div className="col-span-5 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-background rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {lead.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">
                          {lead.name}
                        </div>
                        <div className="text-muted-foreground truncate text-xs">
                          {lead.email}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 flex items-center">
                      <span className="font-bold text-foreground">
                        {lead.score}
                      </span>
                    </div>

                    {/* Temperature */}
                    <div className="col-span-3 flex items-center">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${tempConfig.color}`}
                      >
                        {tempConfig.icon}
                        <span className="capitalize">{lead.temperature}</span>
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="col-span-2 flex items-center">
                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activityConfig.color}`}
                      >
                        {lead.activity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AutomationVisual() {
  return (
    <div className="min-h-[240px] w-full flex items-center justify-center">
      <div className="relative flex items-center gap-8">
        {/* Email */}
        <div className="w-16 h-16 rounded-full border-2 border-primary/30 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <Mail className="w-6 h-6 text-primary" />
        </div>

        {/* Automation Center */}
        <div className="relative">
          <div className="absolute inset-0 bg-brand/20 rounded-full blur-xl" />
          <div className="relative w-20 h-20 rounded-full border-2 border-brand/50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <Zap className="w-8 h-8 text-brand" />
          </div>
        </div>

        {/* Target */}
        <div className="w-16 h-16 rounded-full border-2 border-primary/30 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <Target className="w-6 h-6 text-primary" />
        </div>

        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent -translate-y-1/2" />
      </div>
    </div>
  );
}

function DeliveryVisual() {
  const deliverySteps = [
    { label: "Composed", icon: <Mail className="w-3 h-3" />, completed: true },
    {
      label: "Validated",
      icon: <Shield className="w-3 h-3" />,
      completed: true,
    },
    { label: "Sent", icon: <Send className="w-3 h-3" />, completed: true },
    {
      label: "Delivered",
      icon: <Check className="w-3 h-3" />,
      completed: false,
    },
  ];

  return (
    <div className="min-h-[240px] w-full py-8 flex items-center justify-center">
      <div className="relative w-full max-w-sm">
        {/* Central Delivery Hub */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* Subtle Glow */}
            <div className="absolute inset-0 bg-brand/5 rounded-full blur-lg scale-150" />

            {/* Main Hub Circle */}
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-card/80 to-card/40 border border-brand/20 flex items-center justify-center shadow-md backdrop-blur-sm">
              {/* Inner Content */}
              <div className="relative flex items-center justify-center">
                <MailCheckIcon className="w-7 h-7 text-brand" />

                {/* Status Indicator */}
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    {/* Pulsing Ring */}
                    <div className="absolute inset-0 w-4 h-4 bg-brand/30 rounded-full animate-ping" />
                    {/* Main Status Dot */}
                    <div className="relative w-3 h-3 bg-brand rounded-full shadow-lg">
                      {/* <div className="absolute inset-0.5 bg-card rounded-full" /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-brand/60 rounded-full shadow-sm"
              style={{
                animation: "bounce 3s ease-in-out infinite",
                animationDelay: "0s",
              }}
            />
            <div
              className="absolute -bottom-1 -right-1 w-2 h-2 bg-brand/40 rounded-full shadow-sm"
              style={{
                animation: "bounce 3s ease-in-out infinite",
                animationDelay: "1s",
              }}
            />
            <div
              className="absolute top-2 -right-2 w-2 h-2 bg-brand/70 rounded-full shadow-sm"
              style={{
                animation: "bounce 3s ease-in-out infinite",
                animationDelay: "2s",
              }}
            />
          </div>
        </div>

        {/* Delivery Steps */}
        <div className="relative space-y-3">
          {deliverySteps.map((step, index) => (
            <div key={step.label} className="relative flex items-center gap-3">
              {/* Connection Line */}
              {index < deliverySteps.length - 1 && (
                <div className="absolute left-4 top-8 w-px h-6 bg-gradient-to-b from-brand/30 to-border/50" />
              )}

              {/* Step Icon/Status */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  step.completed
                    ? "bg-brand/10 border-brand/30 text-brand"
                    : "bg-background border-border/50 text-muted-foreground"
                }`}
              >
                {step.completed ? <Check className="w-4 h-4" /> : step.icon}
              </div>

              {/* Step Label */}
              <div className="flex-1">
                <span
                  className={`text-sm font-medium ${
                    step.completed ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Progress Indicator */}
              <div
                className={`w-2 h-2 rounded-full ${
                  step.completed ? "bg-brand" : "bg-muted"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SegmentationVisual() {
  return (
    <div className="min-h-[200px] w-full flex items-center justify-center">
      <div className="relative space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center">
            <Users className="w-6 h-6 text-brand" />
          </div>
          <div className="space-y-1">
            <div className="h-2 w-20 bg-brand/60 rounded"></div>
            <div className="h-2 w-16 bg-muted rounded"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="h-2 w-24 bg-primary/60 rounded"></div>
            <div className="h-2 w-14 bg-muted rounded"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <ChartBarBigIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="h-2 w-24 bg-primary/60 rounded"></div>
            <div className="h-2 w-14 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsVisual() {
  return (
    <div className="min-h-[200px] w-full flex items-center justify-center overflow-hidden">
      <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full max-w-xs h-40">
        <div className="bg-card/30 rounded-lg opacity-30" />
        <div className="bg-card/50 rounded-lg border border-border/30 flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="bg-card/30 rounded-lg opacity-30" />
        <div className="bg-brand/20 rounded-lg border border-brand/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-brand" />
        </div>
        <div className="bg-card/50 rounded-lg border border-border/30 flex items-center justify-center">
          <Mail className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="bg-card/30 rounded-lg opacity-30" />
        <div className="bg-card/50 rounded-lg border border-border/30 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="bg-card/30 rounded-lg opacity-30" />
        <div className="bg-card/30 rounded-lg opacity-30" />
        <div className="bg-card/50 rounded-lg border border-border/30 flex items-center justify-center">
          <Users className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="bg-card/30 rounded-lg opacity-30" />
        <div className="bg-card/50 rounded-lg border border-border/30 flex items-center justify-center">
          <Target className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="bg-card/50 rounded-lg border border-border/30 flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="bg-card/30 rounded-lg opacity-30" />
        <div className="bg-card/50 rounded-lg border border-border/30 flex items-center justify-center">
          <Mail className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="bg-card/30 rounded-lg opacity-30" />
      </div>
    </div>
  );
}

function TileVisual({ type }: { type: string }) {
  switch (type) {
    case "campaign-builder":
      return <CampaignBuilderVisual />;
    case "analytics":
      return <AnalyticsVisual />;
    case "hot-leads":
      return <HotLeadsVisual />;
    case "automation":
      return <AutomationVisual />;
    case "delivery":
      return <DeliveryVisual />;
    case "segmentation":
      return <SegmentationVisual />;
    case "integrations":
      return <IntegrationsVisual />;
    default:
      return null;
  }
}

const tiles = [
  {
    id: "campaign-builder",
    title: "Visual Campaign Builder",
    description:
      "Create beautiful email campaigns with our drag-and-drop editor. No coding required.",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-5",
    visual: "campaign-builder",
  },
  {
    id: "hot-leads",
    title: "Hot Leads Tracking",
    description: "Identify your best leads as they engage.",
    description2: "Never miss a hot lead opportunity again.",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-7",
    visual: "hot-leads",
  },
  {
    id: "analytics",
    title: "Real-time Analytics",
    description:
      "Track open rates, click-through rates, and conversions with detailed insights and reporting.",
    colSpan: "col-span-12 md:col-span-4",
    visual: "analytics",
  },
  {
    id: "automation",
    title: "Smart Automation",
    description:
      "Set up automated email sequences that trigger based on user behavior and preferences.",
    colSpan: "col-span-12 md:col-span-4",
    visual: "automation",
  },
  {
    id: "delivery",
    title: "Reliable Delivery",
    description:
      "Ensure your emails reach the inbox with our optimized delivery infrastructure.",
    colSpan: "col-span-12 md:col-span-4",
    visual: "delivery",
  },
];

export default function BentoGrid() {
  return (
    <section
      id="features"
      className="bg-background text-foreground px-4 py-12 sm:py-24 md:py-32"
    >
      <div className="max-w-container mx-auto flex flex-col items-center gap-6 sm:gap-12">
        <h2 className="text-center text-3xl font-semibold text-balance sm:text-5xl">
          Email marketing made simple
        </h2>
        <p className="text-md text-muted-foreground max-w-[840px] text-center font-medium text-balance sm:text-xl">
          Create powerful email campaigns that convert. Our platform combines
          intuitive design with advanced analytics to help you reach your
          audience effectively and grow your business.
        </p>
        <div className="grid grid-cols-12 gap-4">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={cn(
                "glass-1 hover:glass-2 group text-card-foreground relative flex flex-col gap-6 overflow-hidden rounded-xl p-6 shadow-xl transition-all",
                tile.colSpan,
              )}
            >
              {/* Hover Arrow */}
              {/* <a className="bg-accent/50 absolute top-4 right-4 block rounded-full p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowUpRight className="size-4" />
              </a> */}

              {/* Content */}
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl leading-none font-semibold tracking-tight">
                  {tile.title}
                </h3>
                <div className="text-md text-muted-foreground w-full flex flex-col gap-2 text-balance">
                  <p>{tile.description}</p>
                  {tile.description2 && <p>{tile.description2}</p>}
                </div>
              </div>

              {/* Visual */}
              <div className="flex grow items-end justify-center">
                <TileVisual type={tile.visual} />
              </div>

              {/* Glow Effect */}
              <div className="absolute w-full bottom-0 translate-y-20 scale-x-[1.2] opacity-70 transition-all duration-1000 group-hover:translate-y-8 group-hover:opacity-100">
                <div className="from-brand-foreground/50 to-brand-foreground/0 absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[512px] dark:opacity-100"></div>
                <div className="from-brand/30 to-brand-foreground/0 absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-200 rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[256px] dark:opacity-100"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
