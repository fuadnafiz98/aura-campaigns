import { ReactNode } from "react";

import React from "../../logos/react";
import ShadcnUi from "../../logos/shadcn-ui";
import Tailwind from "../../logos/tailwind";
import TypeScript from "../../logos/typescript";
import { Badge } from "../../ui/badge";
import Logo from "../../ui/logo";
import { Section } from "../../ui/section";
import Convex from "@/components/logos/convex";
import Resend from "@/components/logos/resend";

interface LogosProps {
  title?: string;
  badge?: ReactNode | false;
  logos?: ReactNode[] | false;
  className?: string;
}

export default function Logos({
  title = "Built with industry-standard tools and best practices",
  badge = (
    <Badge
      variant="outline"
      className="border-brand/30 border-2 text-primary text-sm"
    >
      Last updated: 04-07-2025
    </Badge>
  ),
  logos = [
    <Logo key="convex" image={Convex} name="Convex" badge="Featured" />,
    <Logo key="resend" image={Resend} name="Resend" badge="Featured" />,

    <Logo key="react" image={React} name="React" version="19.1.1" />,
    <Logo key="typescript" image={TypeScript} name="TypeScript" />,
    <Logo key="shadcn" image={ShadcnUi} name="Shadcn/ui" />,
    <Logo key="tailwind" image={Tailwind} name="Tailwind" />,
  ],
  className,
}: LogosProps) {
  return (
    <Section className={className} id="tools">
      <div className="max-w-container mx-auto flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-6">
          {badge !== false && badge}
          <h2 className="text-md font-semibold sm:text-2xl">{title}</h2>
        </div>
        {logos !== false && logos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos}
          </div>
        )}
      </div>
    </Section>
  );
}
