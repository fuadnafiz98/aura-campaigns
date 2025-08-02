import { GitBranch, Mail, Users, BarChart3, Clock, Zap } from "lucide-react";

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: GitBranch,
    title: "Visual Campaign Builder",
    description:
      "Drag-and-drop email sequence creation with timeline view and smart scheduling",
  },
  {
    icon: Mail,
    title: "Advanced Email Management",
    description:
      "Rich text editor, live preview, and template management for professional emails",
  },
  {
    icon: Users,
    title: "Smart Lead Management",
    description:
      "Comprehensive lead database with CSV import and audience segmentation tools",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track delivery status, engagement metrics, and campaign performance insights",
  },
  {
    icon: Clock,
    title: "Intelligent Automation",
    description:
      "Time-based sequences with automated lead distribution and background processing",
  },
  {
    icon: Zap,
    title: "Professional Delivery",
    description:
      "Integrated with Resend for reliable delivery and enterprise-grade performance",
  },
];

export default function Features() {
  return (
    <section
      data-slot="section"
      className="bg-background text-foreground px-4 py-12 sm:py-24 md:py-32"
    >
      <div className="max-w-container mx-auto flex flex-col items-center gap-6 sm:gap-20">
        <h2 className="max-w-[560px] text-center text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
          Everything you need for email marketing success.
        </h2>
        <div className="grid auto-rows-fr grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                data-slot="item"
                className="text-foreground flex gap-4 p-4 flex-row items-center"
              >
                <div
                  data-slot="item-icon"
                  className="flex items-center glass-5 self-center rounded-lg p-4"
                >
                  <IconComponent className="text-brand size-8 stroke-1" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3
                    data-slot="item-title"
                    className="text-sm leading-none font-semibold tracking-tight sm:text-base"
                  >
                    {feature.title}
                  </h3>
                  <div
                    data-slot="item-description"
                    className="text-muted-foreground flex max-w-[240px] flex-col gap-2 text-sm text-balance"
                  >
                    {feature.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
