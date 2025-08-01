import { Menu, Rocket } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "@/components/ui/navbar";
import Navigation from "../../ui/navigation";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";

interface NavbarLink {
  text: string;
  href: string;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  className?: string;
}

type NavbarActionProps = {
  text: string;
  href: string;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
};

export default function Navbar({
  logo = "🔥",
  name = "Aura Campaigns",
  homeUrl = "https://www.launchuicomponents.com/",
  mobileLinks = [
    { text: "Getting Started", href: "https://www.launchuicomponents.com/" },
    { text: "Components", href: "https://www.launchuicomponents.com/" },
    { text: "Documentation", href: "https://www.launchuicomponents.com/" },
  ],
  actions = [
    {
      text: "Sign in",
      href: "https://www.launchuicomponents.com/",
      isButton: false,
    },
    {
      text: "Get Started",
      href: "https://www.launchuicomponents.com/",
      isButton: true,
      variant: "default",
    },
  ],
  className,
}: NavbarProps) {
  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
      <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full backdrop-blur-lg"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            {homeUrl.startsWith("/") ? (
              <Link
                to={homeUrl}
                className="flex items-center gap-2 text-xl font-bold"
              >
                {name}
              </Link>
            ) : (
              <a
                href={homeUrl}
                className="flex items-center gap-2 text-xl font-bold"
                target="_blank"
                rel="noopener noreferrer"
              >
                {logo}
                {name}
              </a>
            )}
            <Navigation />
          </NavbarLeft>
          <NavbarRight>
            {actions.map((action, index) => {
              const isInternal = action.href.startsWith("/");
              if (action.isButton) {
                return (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    asChild
                  >
                    {isInternal ? (
                      <Link to={action.href}>
                        {action.icon}
                        {action.text}
                        {action.iconRight}
                      </Link>
                    ) : (
                      <a
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {action.icon}
                        {action.text}
                        {action.iconRight}
                      </a>
                    )}
                  </Button>
                );
              } else {
                return isInternal ? (
                  <Link
                    key={index}
                    to={action.href}
                    className="hidden text-sm md:block"
                  >
                    {action.text}
                  </Link>
                ) : (
                  <a
                    key={index}
                    href={action.href}
                    className="hidden text-sm md:block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {action.text}
                  </a>
                );
              }
            })}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium">
                  {homeUrl.startsWith("/") ? (
                    <Link
                      to={homeUrl}
                      className="flex items-center gap-2 text-xl font-bold"
                    >
                      <span>{name}</span>
                    </Link>
                  ) : (
                    <a
                      href={homeUrl}
                      className="flex items-center gap-2 text-xl font-bold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{name}</span>
                    </a>
                  )}
                  {mobileLinks.map((link, index) =>
                    link.href.startsWith("/") ? (
                      <Link
                        key={index}
                        to={link.href}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {link.text}
                      </Link>
                    ) : (
                      <a
                        key={index}
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.text}
                      </a>
                    ),
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
