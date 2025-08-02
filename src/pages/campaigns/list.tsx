import { useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { Doc, Id } from "#/_generated/dataModel";
import { api } from "#/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreateCampaignModal } from "@/components/modals/campaigns/create-campaign";
import { useNavigate } from "react-router-dom";

type Campaign = Doc<"campaigns">;

export const CampaignsPage = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navigate = useNavigate();

  const {
    results: campaigns,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.campaigns.getCampaigns,
    {
      filterStatus,
      searchQuery,
    },
    { initialNumItems: 10 },
  );

  const totalCampaignsCount = useQuery(api.campaigns.getCampaignsCount, {
    filterStatus,
    searchQuery,
  });

  const handleAddNew = () => {
    console.log("Add new campaign");
    setIsCreateModalOpen(true);
  };

  const handleAction = (campaignId: Id<"campaigns">, action: string) => {
    console.log(`Action ${action} for campaign ${campaignId}`);
  };

  return (
    <Card className="border-border m-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Campaigns</CardTitle>
            <CardDescription className="text-sm">
              Showing {campaigns.length} of {totalCampaignsCount ?? 0} campaigns
            </CardDescription>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-sm border-border"
              />
            </div>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 h-7 cursor-pointer border-border text-sm">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Add New Button */}
            <Button
              size="sm"
              onClick={handleAddNew}
              className="h-8 text-sm cursor-pointer"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add New
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Table className="table-dense">
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm">Campaign Name</TableHead>
              <TableHead className="text-sm">Status</TableHead>
              <TableHead className="text-sm">Target Audience</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Handle initial loading state */}
            {isLoading && status === "LoadingFirstPage" ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading campaigns...
                </TableCell>
              </TableRow>
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No campaigns found
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign: Campaign) => (
                <TableRow
                  key={campaign._id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() =>
                    void navigate(`/app/campaigns/${campaign._id}/`)
                  }
                >
                  <TableCell className="font-medium text-sm">
                    {campaign.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        "text-sm py-0.5 px-3 " +
                        (campaign.status === "active"
                          ? "bg-green-700 text-green-100 border-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                          : campaign.status === "paused"
                            ? "bg-yellow-400 text-yellow-800 border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                            : campaign.status === "completed"
                              ? "bg-blue-400 text-blue-800 border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                              : campaign.status === "draft"
                                ? "bg-foreground/10 text-foreground border-accent dark:bg-background dark:text-gray-300 dark:border-gray-800"
                                : "bg-muted text-muted-foreground border-border")
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {campaign.targetAudience}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Load More Button */}
        <div className="flex items-center justify-center mt-4">
          {status === "CanLoadMore" && (
            <Button
              variant="outline"
              onClick={() => loadMore(10)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          )}
          {status === "LoadingMore" && <>Loading...</>}
          {status === "Exhausted" && campaigns.length > 0 && (
            <p className="text-sm text-muted-foreground">No more campaigns</p>
          )}
        </div>
      </CardContent>
      <CreateCampaignModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </Card>
  );
};

export default CampaignsPage;
