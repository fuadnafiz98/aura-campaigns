import type React from "react";

import { useState, useMemo } from "react";
import { Eye, Send, Filter, ArrowUpDown, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { UploadLeadsModal } from "@/components/modals/import-leads";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  category: string;
}

// Mock data for now - replace with actual data fetching
const mockLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@techcorp.com",
    company: "TechCorp Solutions",
    category: "Technology",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@healthplus.com",
    company: "HealthPlus Medical",
    category: "Healthcare",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael.brown@greenway.com",
    company: "GreenWay Energy",
    category: "Energy",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@financegroup.com",
    company: "Finance Group LLC",
    category: "Finance",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "robert.wilson@autoparts.com",
    company: "AutoParts Express",
    category: "Automotive",
  },
  {
    id: "6",
    name: "Jennifer Garcia",
    email: "jennifer.garcia@foodieworld.com",
    company: "Foodie World",
    category: "Food & Beverage",
  },
  {
    id: "7",
    name: "David Martinez",
    email: "david.martinez@construction.com",
    company: "Martinez Construction",
    category: "Construction",
  },
  {
    id: "8",
    name: "Lisa Anderson",
    email: "lisa.anderson@realestate.com",
    company: "Premier Real Estate",
    category: "Real Estate",
  },
  {
    id: "9",
    name: "James Taylor",
    email: "james.taylor@consulting.com",
    company: "Taylor Consulting",
    category: "Consulting",
  },
  {
    id: "10",
    name: "Amanda White",
    email: "amanda.white@fashionhouse.com",
    company: "Fashion House",
    category: "Fashion",
  },
  {
    id: "9",
    name: "James Taylor",
    email: "james.taylor@consulting.com",
    company: "Taylor Consulting",
    category: "Consulting",
  },
  {
    id: "10",
    name: "Amanda White",
    email: "amanda.white@fashionhouse.com",
    company: "Fashion House",
    category: "Fashion",
  },
];

export const LeadsPage = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Computed values using useMemo for performance
  const filteredAndSortedLeads = useMemo(() => {
    let filtered = mockLeads;

    // Apply filters (placeholder for now since we don't have status in mock data)
    if (filterStatus !== "all") {
      // TODO: Implement filtering when status field is available
      filtered = mockLeads;
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const aValue = a[sortBy as keyof Lead]?.toString() || "";
      const bValue = b[sortBy as keyof Lead]?.toString() || "";
      return aValue.localeCompare(bValue);
    });

    return filtered;
  }, [sortBy, filterStatus]);

  const totalPages = Math.ceil(filteredAndSortedLeads.length / pageSize);
  const selectedCount = selectedLeads.length;

  // Event handlers
  const handleLeadClick = (lead: Lead) => {
    console.log("Lead clicked:", lead);
  };

  const handleSendEmail = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement send email modal
    console.log("Send email to:", lead);
  };

  const handleViewLead = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    handleLeadClick(lead);
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId],
    );
  };

  const selectAllLeads = () => {
    const currentLeadIds = currentLeads.map((lead) => lead.id);
    const allSelected = currentLeadIds.every((id) =>
      selectedLeads.includes(id),
    );

    if (allSelected) {
      setSelectedLeads((prev) =>
        prev.filter((id) => !currentLeadIds.includes(id)),
      );
    } else {
      setSelectedLeads((prev) => [...new Set([...prev, ...currentLeadIds])]);
    }
  };

  // Calculate pagination bounds
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentLeads = filteredAndSortedLeads.slice(startIndex, endIndex);

  return (
    <Card className="border-border m-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Leads</CardTitle>
            <CardDescription className="text-xs"></CardDescription>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {selectedCount} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 text-xs bg-transparent hover:bg-accent border-border cursor-pointer"
                  aria-label={`Send bulk email to ${selectedCount} leads`}
                >
                  Bulk Email
                </Button>
              </div>
            )}
            {/* Import Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="w-24 h-10 border-border text-xs bg-transparent cursor-pointer"
            >
              <Upload className="h-3 w-3 mr-1" />
              Import
            </Button>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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

            {/* Sort Options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-28 cursor-pointer h-7 border-border text-xs">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="category">Category</SelectItem>
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
                    selectedLeads.length === currentLeads.length &&
                    currentLeads.length > 0
                  }
                  onCheckedChange={selectAllLeads}
                  aria-label="Select all leads"
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
            {currentLeads.map((lead: Lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleLeadClick(lead)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => toggleLeadSelection(lead.id)}
                    aria-label={`Select ${lead.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium text-xs">
                  {lead.name}
                </TableCell>
                <TableCell className="text-xs">{lead.email}</TableCell>
                <TableCell className="text-xs">{lead.company}</TableCell>
                <TableCell>
                  <Badge className={`text-xs py-0 px-1`}>{lead.category}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleViewLead(lead, e)}
                      className="h-6 text-xs px-2 border-border bg-background hover:bg-accent cursor-pointer"
                      aria-label={`View ${lead.name}`}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleSendEmail(lead, e)}
                      className="h-6 text-xs px-2 border-border bg-background hover:bg-accent cursor-pointer"
                      aria-label={`Send email to ${lead.name}`}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredAndSortedLeads.length)} of{" "}
              {filteredAndSortedLeads.length} leads
            </div>
            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1;

                    if (!showPage && page === 2 && currentPage > 4) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    if (
                      !showPage &&
                      page === totalPages - 1 &&
                      currentPage < totalPages - 3
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  },
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>

      {/* Import Leads Modal */}
      <UploadLeadsModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />
    </Card>
  );
};
