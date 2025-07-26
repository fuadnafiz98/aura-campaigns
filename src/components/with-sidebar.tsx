import { useConvexAuth, useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon } from "lucide-react";

import { SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "./ui/breadcrumb";
import { AppSidebar } from "./app-sidebar";
import { api } from "../../convex/_generated/api";

function WithSideBar({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();

  const user = useQuery(api.user.getUserInfo);
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-auto flex items-center gap-2 hover:bg-neutral-800 p-2 rounded-lg cursor-pointer">
                  <UserIcon className="h-5 w-5" />
                  <span className="font-medium">
                    {user ? user.user : "Loading..."}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => {
                    void navigate("/signout");
                  }}
                  className="cursor-pointer"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
        {children}
      </SidebarInset>
    </>
  );
}

export default WithSideBar;
