import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "email" | "campaign";
  className?: string;
}

export function StatusBadge({
  status,
  type = "email",
  className,
}: StatusBadgeProps) {
  const getStatusConfig = (status: string, type: string) => {
    if (type === "email") {
      switch (status?.toLowerCase()) {
        case "draft":
          return {
            label: "Draft",
            variant: "outline" as const,
            color: "text-muted-foreground",
          };
        case "scheduled":
          return {
            label: "Scheduled",
            variant: "secondary" as const,
            color: "text-chart-2", // Blue from your theme
          };
        case "sent":
          return {
            label: "Sent",
            variant: "default" as const,
            color: "text-chart-1", // Primary green from your theme
          };
        case "delivered":
          return {
            label: "Delivered",
            variant: "default" as const,
            color: "text-chart-5", // Success green from your theme
          };
        case "failed":
          return {
            label: "Failed",
            variant: "destructive" as const,
            color: "text-destructive-foreground",
          };
        default:
          return {
            label: "Unknown",
            variant: "outline" as const,
            color: "text-muted-foreground",
          };
      }
    } else {
      // Campaign statuses
      switch (status?.toLowerCase()) {
        case "draft":
          return {
            label: "Draft",
            variant: "outline" as const,
            color: "text-muted-foreground",
          };
        case "active":
          return {
            label: "Active",
            variant: "default" as const,
            color: "text-chart-1", // Primary green from your theme
          };
        case "paused":
          return {
            label: "Paused",
            variant: "secondary" as const,
            color: "text-chart-4", // Yellow/amber from your theme
          };
        case "completed":
          return {
            label: "Completed",
            variant: "secondary" as const,
            color: "text-chart-2", // Blue from your theme
          };
        default:
          return {
            label: "Unknown",
            variant: "outline" as const,
            color: "text-muted-foreground",
          };
      }
    }
  };

  const config = getStatusConfig(status, type);

  return (
    <Badge
      variant={config.variant}
      className={cn("text-xs", config.color, className)}
    >
      {config.label}
    </Badge>
  );
}
