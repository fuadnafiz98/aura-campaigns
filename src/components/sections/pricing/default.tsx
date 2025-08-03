import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

import { PricingColumn, PricingColumnProps } from "../../ui/pricing-column";
import { Section } from "../../ui/section";

interface PricingProps {
  title?: string | false;
  description?: string | false;
  plans?: PricingColumnProps[] | false;
  className?: string;
}

export default function Pricing({
  title = "Simple pricing for powerful email marketing",
  description = "Start free and scale as you grow. No hidden fees, no vendor lock-in. Choose the plan that fits your business.",
  plans = [
    {
      name: "Free",
      description: "Perfect for getting started with email marketing",
      price: 0,
      priceNote: "Free forever • Up to 1,000 contacts",
      cta: {
        variant: "glow",
        label: "Get started free",
        href: "/otp-sign-in",
      },
      features: [
        "Up to 1,000 contacts",
        "10 emails per day",
        "Email Sequence builder",
        "Campaign analytics",
        "Email support",
      ],
      variant: "default",
      className: "lg:flex",
    },
    {
      name: "Pro",
      icon: <User className="size-4" />,
      description: "For growing businesses and marketing teams",
      price: 49,
      priceNote: "Per month • Coming soon!",
      cta: {
        variant: "default",
        label: "Coming soon!",
        href: "#",
        disabled: true,
      },
      features: [
        "Up to 25,000 contacts",
        "Unlimited emails",
        "Custom Domains",
        "A/B testing capabilities",
        "Priority support",
      ],
      variant: "glow-brand",
    },
    {
      name: "Enterprise",
      icon: <Users className="size-4" />,
      description: "For large organizations with advanced needs",
      price: "Custom",
      priceNote: "Custom pricing • Coming soon!",
      cta: {
        variant: "default",
        label: "Coming soon!",
        href: "#",
        disabled: true,
      },
      features: [
        "Unlimited contacts & emails",
        "Advanced segmentation & personalization",
        "Multi-brand management",
        "Dedicated account manager",
        "SLA guarantees",
      ],
      variant: "glow",
    },
  ],
  className = "",
}: PricingProps) {
  return (
    <Section id="pricing" className={cn(className)}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12">
        {(title || description) && (
          <div className="flex flex-col items-center gap-4 px-4 text-center sm:gap-8">
            {title && (
              <h2 className="text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-md text-muted-foreground max-w-[600px] font-medium sm:text-xl">
                {description}
              </p>
            )}
          </div>
        )}
        {plans !== false && plans.length > 0 && (
          <div className="max-w-container mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PricingColumn
                key={plan.name}
                name={plan.name}
                icon={plan.icon}
                description={plan.description}
                price={plan.price}
                priceNote={plan.priceNote}
                cta={plan.cta}
                features={plan.features}
                variant={plan.variant}
                className={plan.className}
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
