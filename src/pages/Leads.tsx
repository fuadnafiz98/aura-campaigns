import { useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

// Import your UI components
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Upload, Filter, ArrowUpDown } from "lucide-react";
import { UploadLeadsModal } from "@/components/modals/import-leads";

// Define the Lead type based on your Convex document
type Lead = Doc<"leads">;

export const LeadsPage = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Id<"leads">[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [filterCategory, setFilterCategory] = useState("all"); // Re-added for filtering

  const {
    results: leads,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.leads.getLeads,
    {
      // Pass arguments for your query here
      sortBy,
      // filterCategory,
    },
    { initialNumItems: 10 },
  );

  const totalLeadsCount = useQuery(api.leads.getLeadsCount, { filterCategory });

  const selectedCount = selectedLeads.length;

  const toggleLeadSelection = (leadId: Id<"leads">) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId],
    );
  };

  // Selects all leads that are *currently loaded* on the page
  const selectAllLeads = () => {
    const currentLeadIds = leads.map((lead) => lead._id);
    const allSelectedOnPage = currentLeadIds.every((id) =>
      selectedLeads.includes(id),
    );

    if (allSelectedOnPage) {
      setSelectedLeads((prev) =>
        prev.filter((id) => !currentLeadIds.includes(id)),
      );
    } else {
      setSelectedLeads((prev) => [...new Set([...prev, ...currentLeadIds])]);
    }
  };

  return (
    <Card className="border-border m-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Leads</CardTitle>
            <CardDescription className="text-xs">
              {/* Display loaded vs total count */}
              Showing {leads.length} of {totalLeadsCount ?? 0} leads found
            </CardDescription>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {selectedCount} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 text-xs bg-transparent hover:bg-accent border-border cursor-pointer"
                >
                  Bulk Email
                </Button>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="w-24 h-10 border-border text-xs bg-transparent cursor-pointer"
            >
              <Upload className="h-3 w-3 mr-1" />
              Import
            </Button>

            {/* Filter by Category */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-24 h-7 cursor-pointer border-border text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-28 cursor-pointer h-7 border-border text-xs">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Table className="table-dense">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={
                    leads.length > 0 &&
                    selectedLeads.length > 0 &&
                    leads.every((lead) => selectedLeads.includes(lead._id))
                  }
                  onCheckedChange={selectAllLeads}
                  aria-label="Select all leads on this page"
                />
              </TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Company</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Handle initial loading state */}
            {isLoading && status === "LoadingFirstPage" ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead: Lead) => (
                <TableRow
                  key={lead._id}
                  className="cursor-pointer hover:bg-accent"
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedLeads.includes(lead._id)}
                      onCheckedChange={() => toggleLeadSelection(lead._id)}
                      aria-label={`Select ${lead.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-xs">
                    {lead.name}
                  </TableCell>
                  <TableCell className="text-xs">{lead.email}</TableCell>
                  <TableCell className="text-xs">{lead.company}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs py-0 px-1`}>
                      {lead.category}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* --- LOAD MORE BUTTON --- */}
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
          {status === "Exhausted" && leads.length > 0 && (
            <p className="text-xs text-muted-foreground">No more leads</p>
          )}
        </div>
      </CardContent>

      <UploadLeadsModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />
    </Card>
  );
};
