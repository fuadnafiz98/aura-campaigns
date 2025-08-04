import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import Plane from "@/components/logos/plane";
import {
  Footer,
  FooterBottom,
  FooterColumn,
  FooterContent,
} from "@/components/ui/footer";
import { Link } from "react-router-dom";
import { loginRoute } from "@/constants";

interface FooterLink {
  text: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: ReactNode;
  name?: string;
  columns?: FooterColumnProps[];
  copyright?: string;
  policies?: FooterLink[];
  showModeToggle?: boolean;
  className?: string;
}

export default function FooterSection({
  logo = <Plane />,
  name = "Aura Campaigns",
  copyright = "© 2025 Aura Campaigns. All rights reserved. | GDPR & CAN-SPAM Compliant | Built for your growth.",
  className,
}: FooterProps) {
  return (
    <footer className={cn("bg-background w-full px-4", className)}>
      <div className="max-w-container mx-auto">
        <Footer>
          <FooterContent>
            <FooterColumn className="col-span-2 sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-2">
                {logo}
                <h3 className="text-xl font-bold">{name}</h3>
              </div>
            </FooterColumn>
          </FooterContent>
          <FooterBottom>
            <div>{copyright}</div>
            <div className="flex items-center gap-4">
              <span>
                Ready to grow?{" "}
                <Link to={loginRoute} className="underline">
                  Start your free trial
                </Link>
              </span>
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
