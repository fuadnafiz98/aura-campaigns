import * as React from "react";
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HomeIcon } from "./ui/home";
import { Zap } from "lucide-react";
import { UsersIcon } from "./ui/users";
import { PartyPopperIcon } from "./ui/party-popper";
import Plane from "../../public/plane.svg";

interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export const data = {
  navMain: [
    {
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: HomeIcon,
        },
        { title: "Leads", url: "/leads", icon: UsersIcon },
        { title: "Campaigns", url: "/campaigns", icon: PartyPopperIcon },
      ],
    },
  ],
};

const DisplayMenuItem = ({
  item,
  className = "",
  ...props
}: {
  item: any;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const iconRef = React.useRef<IconHandle>(null);

  return (
    <div
      className={
        "flex items-center space-x-2 px-4 py-2 hover:bg-muted rounded-lg " +
        className
      }
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      {...props}
    >
      <item.icon size={16} ref={iconRef}></item.icon>
      <span className="text-sm">{item.title}</span>
    </div>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row items-center space-x-1 mx-3">
        <div className="flex h-12 items-center justify-center rounded-lg overflow-hidden">
          <img
            src={Plane}
            className="w-7 h-7 object-contain mx-auto"
            alt="Logo"
          />
        </div>
        <span className="font-medium">Aura Campaigns</span>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url} end>
                      {({ isActive }) => (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <DisplayMenuItem item={item} />
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
