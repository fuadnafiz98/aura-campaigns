import React, { useState, useCallback, useMemo } from "react";
import {
  Reorder,
  motion,
  useDragControls,
  AnimatePresence,
} from "framer-motion";
import { Mail, Clock, GripVertical, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmailEditDialog } from "@/components/modals/campaigns/edit-email";

// --- TYPE DEFINITION ---
interface Email {
  id: string;
  subject: string;
  body: string;
  delay: number;
  delayUnit: "minutes" | "hours" | "days";
}

// --- OPTIMIZATION 1: Memoize the Particle Line ---
// This component is now memoized. It will only re-render if its `count` prop changes.
// This prevents the complex particle animation from re-calculating on every list reorder.
const ParticleLine = React.memo(({ count }: { count: number }) => {
  const connectionLineHeight = (count - 1) * 96 + 32;

  // Memoize the particles array to prevent re-mapping on every render
  const particles = useMemo(() => Array.from({ length: 5 }), []);

  if (count <= 1) return null;
  return (
    <motion.div
      className="absolute top-0 w-0.5 pointer-events-none left-1/2 -translate-x-1/2"
      initial={{ height: 0 }}
      animate={{ height: connectionLineHeight }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <div className="absolute inset-0 w-0.5 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
      <div className="absolute inset-0 w-4 -left-[7px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-sm" />
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 left-[-1.5px] bg-primary rounded-full shadow-[0_0_6px_var(--color-primary)]"
          animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2 + count * 0.3,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "linear",
          }}
        />
      ))}
    </motion.div>
  );
});
ParticleLine.displayName = "ParticleLine";

// --- OPTIMIZATION 2: Memoize the Email Card ---
// The EmailCard component is wrapped in React.memo.
// It will only re-render if its props (email, index, onEdit, onDelete) change.
// This is the most significant performance gain for lists.
const EmailCard = React.memo(({ email, index, onEdit, onDelete }: any) => {
  const dragControls = useDragControls();

  // OPTIMIZATION 3: Memoize derived computations
  // This value is now only recalculated if the relevant `email` props change.
  const delayText = useMemo(() => {
    if (email.delay === 0) return "Send immediately";
    return `${email.delay} ${email.delayUnit}`;
  }, [email.delay, email.delayUnit]);

  // OPTIMIZATION 4: Use stable callback references for handlers
  const handleEdit = useCallback(() => onEdit(email.id), [onEdit, email.id]);
  const handleDelete = useCallback(
    () => onDelete(email.id),
    [onDelete, email.id],
  );

  return (
    <Reorder.Item
      value={email}
      id={email.id}
      dragListener={false}
      dragControls={dragControls}
      // OPTIMIZATION 5: Use `layout="position"` for better performance on items that don't change size
      layout="position"
      // OPTIMIZATION 6: Hinting the browser about upcoming transform changes
      className="relative will-change-transform"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        y: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn(
          "relative bg-muted backdrop-blur-sm border border-border rounded-xl shadow-lg",
          "hover:border-primary hover:shadow-xl hover:shadow-primary/5",
          "transition-colors duration-200",
        )}
      >
        {/* Delay Badge */}
        {index > 0 && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 bg-muted px-5 py-2 rounded-full border border-border text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Wait {delayText}</span>
            </div>
          </div>
        )}

        <div className="p-4">
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-4 h-4 text-zinc-600 hover:text-zinc-400" />
          </div>
          <div className="ml-6 flex items-center justify-between">
            <div className="flex-1 flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">{email.subject}</h3>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEdit}
                className="p-2 hover:bg-zinc-800 rounded-lg"
              >
                <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDelete}
                className="p-2 hover:bg-red-950/50 rounded-lg group"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
});
EmailCard.displayName = "EmailCard";

// --- MAIN COMPONENT ---
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

  // OPTIMIZATION 7: Stabilize all event handlers with `useCallback`
  // This prevents them from being recreated on every render, which is crucial for `React.memo` to work on child components.
  const handleReorder = useCallback((newOrder: Email[]) => {
    setEmails(newOrder);
  }, []);

  const handleEdit = useCallback(
    (id: string) => {
      console.log("ID", id);
      const emailToEdit = emails.find((e) => e.id === id);
      console.log("ID", emailToEdit);
      if (emailToEdit) {
        setEditingEmail(emailToEdit);
      }
    },
    [emails],
  );
  const handleDialogClose = useCallback(() => {
    setEditingEmail(null);
  }, []);

  // NEW function to save the updated email from the dialog
  const handleSaveEmail = useCallback((updatedEmail: Email) => {
    setEmails((currentEmails) =>
      currentEmails.map((email) =>
        email.id === updatedEmail.id ? updatedEmail : email,
      ),
    );
    setEditingEmail(null); // Close the dialog after saving
  }, []);

  const handleDelete = useCallback((id: string) => {
    // Using the functional update form of `useState` ensures we don't need `emails` in the dependency array.
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
          className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Email
        </Button>
      </div>
      <EmailEditDialog
        initialEmail={editingEmail}
        isOpen={!!editingEmail}
        onOpenChange={(isOpen) => !isOpen && handleDialogClose()}
        onSave={handleSaveEmail}
      />
    </div>
  );
}
