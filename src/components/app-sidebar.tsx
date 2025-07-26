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
import { Zap, Home, Users, Megaphone } from "lucide-react";

const data = {
  navMain: [
    {
      title: "Main",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: Home },
        { title: "Leads", url: "/leads", icon: Users },
        { title: "Campaigns", url: "/campaigns", icon: Megaphone },
      ],
    },
  ],
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
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url} end>
                      {({ isActive }) => (
                        <SidebarMenuButton asChild isActive={isActive}>
                          <div className="flex items-center space-x-2">
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </div>
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
