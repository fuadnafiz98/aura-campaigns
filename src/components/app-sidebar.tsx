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

const DisplayMenuItem = ({ item }: { item: any }) => {
  const iconRef = React.useRef<IconHandle>(null);

  return (
    <div
      className="flex items-center space-x-2 px-4 py-2 hover:bg-muted rounded-lg"
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <item.icon size={16} ref={iconRef}></item.icon>
      <span className="text-sm">{item.title}</span>
    </div>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row items-center space-x-2">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
          <Zap className="size-4" />
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
