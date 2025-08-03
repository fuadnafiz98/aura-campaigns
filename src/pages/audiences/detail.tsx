import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowLeft, ArrowUpDown, Trash, Upload } from "lucide-react";
import { toast } from "sonner";
import BreadcrumbItems from "@/components/breadcrumb-items";
import { UploadLeadsModal } from "@/components/modals/import-leads";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

type Lead = Doc<"leads"> & {
  addedAt: number;
};

export default function AudienceDetailPage() {
  const { audienceId } = useParams<{ audienceId: Id<"audiences"> }>();
  const navigate = useNavigate();
  const [selectedLeads, setSelectedLeads] = useState<Id<"leads">[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const audience = useQuery(
    api.audiences.getAudience,
    audienceId ? { id: audienceId } : "skip",
  );

  const leads = useQuery(
    api.audiences.getAudienceLeads,
    audienceId ? { audienceId, sortBy } : "skip",
  );

  const leadsCount = useQuery(
    api.audiences.getAudienceLeadsCount,
    audienceId ? { audienceId } : "skip",
  );

  const removeLeadFromAudience = useMutation(
    api.audiences.removeLeadFromAudience,
  );

  const selectedCount = selectedLeads.length;

  const toggleLeadSelection = (leadId: Id<"leads">) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId],
    );
  };

  const selectAllLeads = () => {
    if (!leads) return;

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

  const handleRemoveSelected = () => {
    if (selectedCount === 0 || !audienceId) return;
    setDeleteDialogOpen(true);
  };

  const handleRemoveConfirm = async () => {
    if (selectedCount === 0 || !audienceId) return;

    setIsRemoving(true);
    try {
      await Promise.all(
        selectedLeads.map((leadId) =>
          removeLeadFromAudience({ audienceId, leadId }),
        ),
      );
      toast.success(`${selectedCount} lead(s) removed from audience`);
      setSelectedLeads([]);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(`Error removing leads: ${(error as Error).message}`);
    } finally {
      setIsRemoving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (!audienceId) {
    return (
      <Card className="border-border m-4">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Invalid audience ID</p>
        </CardContent>
      </Card>
    );
  }

  if (audience === null) {
    return (
      <Card className="border-border m-4">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Audience not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mx-5 mt-5 mb-2">
        <BreadcrumbItems
          items={[
            { label: "Audiences", href: "/app/audiences" },
            { label: audience?.name || "Loading..." },
          ]}
        />
      </div>
      <Card className="border-border m-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/app/audiences")}
                className="p-2 curosr-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-sm">
                  {audience?.name || "Loading..."}
                </CardTitle>
                <CardDescription className="text-sm">
                  {audience?.description && (
                    <span className="block">{audience.description}</span>
                  )}
                  Showing {leads?.length || 0} of {leadsCount || 0} leads
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    {selectedCount} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveSelected}
                    className="h-10 text-sm bg-transparent hover:bg-destructive hover:text-destructive-foreground border-border cursor-pointer"
                  >
                    <Trash className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsUploadModalOpen(true)}
                className="w-24 h-9 border-border text-sm bg-transparent cursor-pointer"
              >
                <Upload className="h-3 w-3 mr-1" />
                Import
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 cursor-pointer h-10 border-border text-sm">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="added">Date Added</SelectItem>
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
                      leads &&
                      leads.length > 0 &&
                      selectedLeads.length > 0 &&
                      leads.every((lead) => selectedLeads.includes(lead._id))
                    }
                    onCheckedChange={selectAllLeads}
                    aria-label="Select all leads on this page"
                  />
                </TableHead>
                <TableHead className="text-sm">Name</TableHead>
                <TableHead className="text-sm">Email</TableHead>
                <TableHead className="text-sm">Company</TableHead>
                <TableHead className="text-sm">Category</TableHead>
                <TableHead className="text-sm">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!leads ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading leads...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No leads in this audience yet
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
                    <TableCell className="font-medium text-sm">
                      {lead.name}
                    </TableCell>
                    <TableCell className="text-sm">{lead.email}</TableCell>
                    <TableCell className="text-sm">{lead.company}</TableCell>
                    <TableCell>
                      <Badge className="text-sm py-0 px-1">
                        {lead.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(lead.addedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {audience && (
          <UploadLeadsModal
            open={isUploadModalOpen}
            onOpenChange={setIsUploadModalOpen}
            audienceId={audienceId}
            audienceName={audience.name}
          />
        )}

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleRemoveConfirm}
          title={`Remove ${selectedCount} lead(s)?`}
          description={`Are you sure you want to remove ${selectedCount} lead(s) from "${audience?.name}"? This will not delete the leads completely, just remove them from this audience.`}
          loading={isRemoving}
        />
      </Card>
    </>
  );
}
