import { useState, useCallback } from "react";
import { Reorder, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoveLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailEditDialog } from "@/components/modals/campaigns/edit-email";
import { ParticleLine } from "@/components/animations/partical-line";
import { EmailCard } from "@/components/campaigns/email-card";
import { Email } from "@/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

export default function EmailCampaignFlow() {
  const [emails, setEmails] = useState<Email[]>([
    {
      id: "1",
      subject: "Welcome to our platform",
      body: "body",
      delay: 0,
      delayUnit: "minutes",
    },
    {
      id: "2",
      subject: "Getting started guide",
      delay: 1,
      delayUnit: "days",

      body: "body",
    },
    {
      id: "3",
      subject: "Pro tips for success",
      delay: 3,
      delayUnit: "days",

      body: "body",
    },
    {
      id: "4",
      subject: "Check out our new features",
      delay: 7,
      delayUnit: "days",
      body: "body",
    },
  ]);

  const [editingEmail, setEditingEmail] = useState<Email | null>(null);

  const handleReorder = useCallback((newOrder: Email[]) => {
    setEmails(newOrder);
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      const emailToEdit = emails.find((e) => e.id === id);
      if (emailToEdit) {
        setEditingEmail(emailToEdit);
      }
    },
    [emails],
  );
  const handleDialogClose = useCallback(() => {
    setEditingEmail(null);
  }, []);

  const handleSaveEmail = useCallback((updatedEmail: Email) => {
    setEmails((currentEmails) =>
      currentEmails.map((email) =>
        email.id === updatedEmail.id ? updatedEmail : email,
      ),
    );
    setEditingEmail(null); // Close the dialog after saving
  }, []);

  const handleDelete = useCallback((id: string) => {
    setEmails((currentEmails) =>
      currentEmails.filter((email) => email.id !== id),
    );
  }, []);

  const handleAddEmail = useCallback(() => {
    const newEmail: Email = {
      id: Date.now().toString(),
      subject: "New Email",
      delay: 1,
      delayUnit: "days",
      body: "",
    };
    setEmails((currentEmails) => [...currentEmails, newEmail]);
  }, []);

  return (
    <>
      <div className="mx-16 mt-4">
        <Link
          to="/campaigns"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Go back to campaigns</span>
        </Link>
      </div>
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Email Campaign Flow
          </h2>
          <p className="text-muted-foreground">
            Drag and drop to reorder your email sequence
          </p>
        </div>

        <div className="relative">
          <ParticleLine count={emails.length} />

          <Reorder.Group
            axis="y"
            values={emails}
            onReorder={handleReorder}
            className="space-y-8"
          >
            <AnimatePresence>
              {emails.map((email, index) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        <div className="flex items-center justify-center w-full my-6">
          <Button
            onClick={handleAddEmail}
            className="cursor-pointer bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Email
          </Button>
        </div>
        {/* Can we move it to Email Card? */}
        <EmailEditDialog
          initialEmail={editingEmail}
          isOpen={!!editingEmail}
          onOpenChange={(isOpen) => !isOpen && handleDialogClose()}
          onSave={handleSaveEmail}
        />
      </div>
    </>
  );
}
