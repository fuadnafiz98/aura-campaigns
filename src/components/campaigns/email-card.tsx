import React, { useCallback, useMemo } from "react";
import { Reorder, motion, useDragControls } from "framer-motion";
import { Mail, Clock, GripVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "#/_generated/api";
import { toast } from "sonner";
import { EmailEditDialog } from "../modals/campaigns/edit-email";
import { Doc } from "#/_generated/dataModel";

type Email = Doc<"emails">;

export const EmailCard = React.memo(({ email }: { email: Email }) => {
  const dragControls = useDragControls();
  const [isOpen, setIsOpen] = React.useState(false);

  const deleteEmail = useMutation(api.emails.deleteEmail);
  const [loading, setLoading] = React.useState(false);

  const delayText = useMemo(() => {
    if (email.delay === 0) return "Send immediately";
    return `${email.delay} ${email.delayUnit}`;
  }, [email.delay, email.delayUnit]);

  const handleDelete = useCallback(() => {
    setLoading(true);
    deleteEmail({ id: email._id })
      .then(() => {
        toast.success("Email deleted successfully");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error deleting email:", error);
        toast.error("Failed to delete email");
        setLoading(false);
      });
  }, [deleteEmail, email._id]);

  return (
    <Reorder.Item
      value={email}
      id={email._id}
      dragControls={dragControls}
      dragListener={false}
      layout="position"
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
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 bg-muted px-5 py-2 rounded-full border border-border text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{delayText}</span>
          </div>
        </div>

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
                onClick={() => setIsOpen(true)}
                disabled={loading}
                className="p-2 hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                <Edit className="w-4 h-4  text-muted-foreground hover:text-foreground" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={loading}
                onClick={handleDelete}
                className="p-2 hover:bg-red-950/50 rounded-lg group cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-destructive text-destructive border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive/95" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <EmailEditDialog
        id={email._id}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </Reorder.Item>
  );
});

EmailCard.displayName = "EmailCard";
