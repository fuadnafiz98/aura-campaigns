import React from "react";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Loader2,
  TrendingUp,
  Activity,
  Zap,
  RefreshCw,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const getStatusConfig = (status: string) => {
  const statusMap: Record<
    string,
    {
      badge: string;
      icon: React.ReactNode;
      pulse?: string;
    }
  > = {
    delivered: {
      badge:
        "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    sent: {
      badge:
        "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      icon: <Send className="w-3.5 h-3.5" />,
    },
    pending: {
      badge:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      icon: <Clock className="w-3.5 h-3.5" />,
      pulse:
        "before:absolute before:inset-0 before:rounded-full before:bg-amber-500 before:animate-ping before:opacity-75",
    },
    queued: {
      badge:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      icon: <Clock className="w-3.5 h-3.5" />,
      pulse:
        "before:absolute before:inset-0 before:rounded-full before:bg-amber-500 before:animate-ping before:opacity-75",
    },
    failed: {
      badge: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    bounced: {
      badge:
        "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    opened: {
      badge:
        "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
      icon: <Mail className="w-3.5 h-3.5" />,
    },
    clicked: {
      badge:
        "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      icon: <Zap className="w-3.5 h-3.5" />,
    },
  };

  return (
    statusMap[status.toLowerCase()] || {
      badge:
        "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
      icon: <Activity className="w-3.5 h-3.5" />,
    }
  );
};

const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const EmailLiveLogsTab = () => {
  const emailLogs = useQuery(api.emailLogs.listEmailLogs, { limit: 100 });

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Email Logs Table */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Recent Email Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time email delivery tracking and status updates
              </p>
            </div>
            {emailLogs && emailLogs.length > 0 && (
              <Badge variant="outline" className="px-3 py-1">
                {emailLogs.length} logs
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 px-6">
          {emailLogs ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead className="font-medium text-muted-foreground py-4">
                      Recipient
                    </TableHead>
                    <TableHead className="font-medium text-muted-foreground">
                      Subject
                    </TableHead>
                    <TableHead className="font-medium text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="font-medium text-muted-foreground">
                      Event Triggered
                    </TableHead>
                    <TableHead className="font-medium text-muted-foreground">
                      Sent
                    </TableHead>
                    <TableHead className="font-medium text-muted-foreground">
                      Updated
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs.map((log) => {
                    const statusConfig = getStatusConfig(log.status);
                    return (
                      <TableRow
                        key={log._id}
                        className="border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-foreground/15 to-background rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                              {log?.to?.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[200px] text-foreground">
                              {log.to}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div
                            className="truncate text-muted-foreground"
                            title={log.subject}
                          >
                            {log.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-medium flex items-center gap-1.5 px-3 py-1.5 shadow-sm transition-all duration-300 hover:scale-105",
                              statusConfig.badge,
                            )}
                          >
                            <div className="relative">{statusConfig.icon}</div>
                            <span className="capitalize font-medium">
                              {log.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.event && log.event !== log.status ? (
                            <Badge
                              variant="outline"
                              className="capitalize px-3 py-2 border-border text-muted-foreground/90"
                            >
                              {log.event}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatRelativeTime(log.createdAt)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatRelativeTime(log.updatedAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Loading email logs...
              </h3>
              <p className="text-muted-foreground">
                Please wait while we fetch your email data
              </p>
            </div>
          )}

          {emailLogs && emailLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No email logs found
              </h3>
              <p className="text-muted-foreground mb-4">
                Send some test emails to see activity here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailLiveLogsTab;
