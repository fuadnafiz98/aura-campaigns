import {
  ArrowUpRight,
  Mail,
  BarChart3,
  Users,
  Target,
  Zap,
  GitBranch,
  ChartBarBigIcon,
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
  return (
    <div className="min-h-[240px] w-full relative p-4">
      <div className="relative h-full w-full max-w-md mx-auto">
        <Card className="relative min-h-[240px] glass-1 border-border/50">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Campaign Analytics</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Open Rate</span>
                <span className="text-sm font-medium text-brand">24.5%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-brand h-2 rounded-full"
                  style={{ width: "24.5%" }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Click Rate
                </span>
                <span className="text-sm font-medium text-brand">12.3%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-brand h-2 rounded-full"
                  style={{ width: "12.3%" }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Conversion
                </span>
                <span className="text-sm font-medium text-brand">5.2%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-brand h-2 rounded-full"
                  style={{ width: "5.2%" }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AutomationVisual() {
  return (
    <div className="min-h-[200px] w-full flex items-center justify-center">
      <div className="relative flex items-center gap-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-brand/30 rounded-full blur-2xl scale-150" />
          <div className="relative w-20 h-20 rounded-full border-2 border-brand/50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-brand/30 bg-brand/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-brand" />
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent -translate-y-1/2" />
      </div>
    </div>
  );
}

function DeliveryVisual() {
  return (
    <div className="min-h-[200px] w-full py-8 flex items-center justify-center">
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-2 border-brand/30 relative overflow-hidden glass-1">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent" />
          <div className="absolute top-1/2 left-0 w-full h-px bg-brand/40" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-brand/40" />
          <div className="absolute inset-4 rounded-full border border-brand/20" />
          <div className="absolute inset-8 rounded-full border border-brand/10" />
          <Mail className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-brand" />
        </div>
        <div className="absolute inset-0 bg-brand/10 rounded-full blur-xl" />
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
    id: "analytics",
    title: "Real-time Analytics",
    description:
      "Track open rates, click-through rates, and conversions with detailed insights and reporting.",
    description2: "Make data-driven decisions to optimize your campaigns.",
    colSpan: "col-span-12 md:col-span-6 lg:col-span-7",
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
  {
    id: "segmentation",
    title: "Advanced Segmentation",
    description:
      "Target the right audience with powerful segmentation tools and personalization.",
    colSpan: "col-span-12 md:col-span-4",
    visual: "segmentation",
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
                <div className="text-md text-muted-foreground flex flex-col gap-2 text-balance">
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
