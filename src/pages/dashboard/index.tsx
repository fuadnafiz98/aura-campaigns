import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HotLeadsTab from "./hot-leads";
import EmailLiveLogsTab from "./email-live-logs";
import { FlameIcon } from "@/components/ui/flame";
import { ActivityIcon } from "@/components/ui/activity";

interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

const TabsButton = ({
  id,
  label,
  icon,
}: {
  id: string;
  label: string;
  icon: any;
}) => {
  const IconComponent = icon;
  const iconRef = React.useRef<IconHandle>(null);

  // Tab-specific styling
  const getTabStyles = (tabId: string) => {
    switch (tabId) {
      case "hot-leads":
        return "flex items-center gap-2  data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 hover:bg-destructive";
      case "email-logs":
        return "flex items-center gap-2  data-[state=active]:text-primary dark:data-[state=active]:text-primary hover:bg-primary";
      default:
        return "flex items-center gap-2";
    }
  };

  return (
    <TabsTrigger
      onMouseEnter={() => {
        iconRef.current?.startAnimation();
      }}
      onMouseLeave={() => {
        iconRef.current?.stopAnimation();
      }}
      value={id}
      className={getTabStyles(id)}
    >
      <IconComponent ref={iconRef} />
      <span>{label}</span>
    </TabsTrigger>
  );
};

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col space-y-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your leads and email campaigns
            </p>
          </div>
        </div>

        {/* Tabs Container */}
        <Tabs defaultValue="hot-leads" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsButton id="hot-leads" label="Hot Leads" icon={FlameIcon} />
            <TabsButton
              id="email-logs"
              label="Email Live Logs"
              icon={ActivityIcon}
            />
          </TabsList>

          <TabsContent value="hot-leads" className="mt-6">
            <HotLeadsTab />
          </TabsContent>

          <TabsContent value="email-logs" className="mt-6">
            <EmailLiveLogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;
