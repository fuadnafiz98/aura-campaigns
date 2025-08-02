import { useDeferredValue, useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Copy,
  Trash,
  EyeIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreateAudienceModal } from "@/components/modals/audiences/create-audience";
import { CloneAudienceDialog } from "@/components/modals/audiences/clone-audience-dialog";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type Audience = Doc<"audiences"> & {
  leadsCount: number;
};

export default function AudiencePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    audience: { id: Id<"audiences">; name: string } | null;
  }>({
    open: false,
    audience: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const audiences = useQuery(api.audiences.getAudiences, {
    search: searchQuery || undefined,
    sortBy: sortBy || undefined,
  });

  const audiencesCount = useQuery(api.audiences.getAudiencesCount);
  const deleteAudience = useMutation(api.audiences.deleteAudience);

  const handleDeleteClick = (id: Id<"audiences">, name: string) => {
    setDeleteDialog({
      open: true,
      audience: { id, name },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.audience) return;

    setIsDeleting(true);
    try {
      await deleteAudience({ id: deleteDialog.audience.id });
      toast.success("Audience deleted successfully");
      setDeleteDialog({ open: false, audience: null });
    } catch (error) {
      toast.error(`Error deleting audience: ${(error as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      <Card className="border-border m-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Audiences</CardTitle>
              <CardDescription className="text-sm">
                Showing {audiences?.length || 0} of {audiencesCount || 0}{" "}
                audiences
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-36 h-9 text-sm cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                New Audience
              </Button>

              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search audiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-48 h-9 text-sm border-border"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 cursor-pointer h-8 border-border text-sm">
                  <ArrowUpDownIcon className="h-3 w-3 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Table className="table-dense">
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="text-sm text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="text-sm text-muted-foreground">
                  Leads
                </TableHead>
                <TableHead className="text-sm text-muted-foreground">
                  Created
                </TableHead>
                <TableHead className="text-sm text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!audiences ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading audiences...
                  </TableCell>
                </TableRow>
              ) : audiences.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    {searchQuery
                      ? "No audiences found matching your search"
                      : "No audiences created yet"}
                  </TableCell>
                </TableRow>
              ) : (
                audiences.map((audience: Audience) => (
                  <TableRow
                    key={audience._id}
                    className="cursor-pointer hover:bg-accent"
                  >
                    <TableCell
                      className="font-medium text-sm hover:underline hover:cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/app/audiences/${audience._id}`)}
                    >
                      {audience.name}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {audience.description || "No description"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {audience.leadsCount}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(audience.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant={"outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/audiences/${audience._id}`);
                          }}
                          className="h-8 px-3 cursor-pointer"
                        >
                          <EyeIcon className="h-2 w-2" />
                        </Button>
                        <CloneAudienceDialog
                          audienceId={audience._id}
                          originalName={audience.name}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 px-3 cursor-pointer hover:text-primary"
                          >
                            <Copy className="h-2 w-2" />
                          </Button>
                        </CloneAudienceDialog>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(audience._id, audience.name);
                          }}
                          className="h-8 px-3 cursor-pointer hover:text-destructive"
                        >
                          <Trash className="h-2 w-2" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CreateAudienceModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />

        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, audience: null })}
          onConfirm={handleDeleteConfirm}
          itemName={deleteDialog.audience?.name}
          loading={isDeleting}
          description="This will permanently delete the audience and remove all associated leads from this audience."
        />
      </Card>
    </>
  );
}
