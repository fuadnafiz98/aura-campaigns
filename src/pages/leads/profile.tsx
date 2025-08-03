import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "#/_generated/api";
import { Id } from "#/_generated/dataModel";
import { ArrowLeft, Mail, Building, Tag, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LeadProfilePage() {
  const { leadId } = useParams<{ leadId: Id<"leads"> }>();
  const navigate = useNavigate();

  const lead = useQuery(api.leads.getLead, leadId ? { id: leadId } : "skip");

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent mx-auto rounded-full animate-spin mb-4"></div>
          <span className="text-muted-foreground text-base font-medium">
            Loading lead profile...
          </span>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Extract first name and last name from the full name
  const nameParts = lead.name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Lead Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Detailed information about this lead
            </p>
          </div>
        </div>

        {/* Main Profile Card */}
        <Card className="glass-2 border-border">
          <CardHeader className="pb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-brand/10 flex items-center justify-center border border-border/50">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-brand rounded-lg flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Name and basic info */}
              <div className="flex-1 space-y-2">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {lead.name}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {firstName && lastName
                      ? `${firstName} ${lastName}`
                      : lead.name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-brand/10 text-brand border-brand/20 px-3 py-1"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {lead.category}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Email Address
                  </h3>
                </div>
                <div className="ml-10">
                  <p className="text-foreground font-medium">{lead.email}</p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Send email
                  </a>
                </div>
              </div>

              {/* Company */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Building className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">Company</h3>
                </div>
                <div className="ml-10">
                  <p className="text-foreground font-medium">{lead.company}</p>
                  <p className="text-sm text-muted-foreground">Organization</p>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">Category</h3>
                </div>
                <div className="ml-10">
                  <p className="text-foreground font-medium">{lead.category}</p>
                  <p className="text-sm text-muted-foreground">
                    Lead classification
                  </p>
                </div>
              </div>

              {/* Import Date */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">Added</h3>
                </div>
                <div className="ml-10">
                  <p className="text-foreground font-medium">
                    {formatDate(lead.imported_at)}
                  </p>
                  <p className="text-sm text-muted-foreground">Import date</p>
                </div>
              </div>
            </div>

            {/* Contact Summary */}
            <div className="pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                Contact Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/50 border border-border rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {firstName || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    First Name
                  </div>
                </div>
                <div className="bg-card/50 border border-border rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {lastName || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">Last Name</div>
                </div>
                <div className="bg-card/50 border border-border rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">Active</div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="glass-1 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                className="cursor-pointer"
                onClick={() => window.open(`mailto:${lead.email}`, "_blank")}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer border-border"
                onClick={() => navigate("/app/leads")}
              >
                Back to Leads
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
