import React, { useState } from "react";
import { Reorder, motion, useDragControls } from "framer-motion";
import { Mail, Clock, GripVertical, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Email {
  id: string;
  subject: string;
  delay: number;
  delayUnit: "minutes" | "hours" | "days";
}

interface EmailCardProps {
  email: Email;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const EmailCard = ({ email, index, onEdit, onDelete }: EmailCardProps) => {
  const dragControls = useDragControls();

  const getDelayText = () => {
    if (email.delay === 0) return "Send immediately";
    return `${email.delay} ${email.delayUnit}`;
  };

  return (
    <Reorder.Item
      value={email}
      id={email.id}
      dragListener={false}
      dragControls={dragControls}
      className="relative"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "relative bg-muted backdrop-blur-sm border border-border rounded-xl shadow-lg",
          "hover:border-primary hover:shadow-xl hover:shadow-primary/5",
          "transition-all duration-200",
        )}
      >
        {/* Delay Badge */}
        {index > 0 && (
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <div className="flex items-center gap-2 bg-muted px-5 py-2 rounded-full border border-border text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Wait {getDelayText()}</span>
            </div>
          </motion.div>
        )}

        <div className="p-4">
          {/* Drag Handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-4 h-4 text-zinc-600 hover:text-zinc-400 transition-colors" />
          </div>

          <div className="ml-6 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium text-foreground">{email.subject}</h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(email.id)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(email.id)}
                className="p-2 hover:bg-red-950/50 rounded-lg transition-colors group"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Connection Dot */}
        {/* <motion.div
          className="absolute left-[26px] top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full ring-4 ring-zinc-950 z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
        /> */}
      </motion.div>
    </Reorder.Item>
  );
};

export default function EmailCampaignFlow() {
  const [emails, setEmails] = useState<Email[]>([
    {
      id: "1",
      subject: "Welcome to our platform",
      delay: 0,
      delayUnit: "minutes",
    },
    { id: "2", subject: "Getting started guide", delay: 1, delayUnit: "days" },
    { id: "3", subject: "Pro tips for success", delay: 3, delayUnit: "days" },
    {
      id: "4",
      subject: "Check out our new features",
      delay: 7,
      delayUnit: "days",
    },
  ]);

  const handleReorder = (newOrder: Email[]) => {
    setEmails(newOrder);
  };

  const handleEdit = (id: string) => {
    console.log("Edit email:", id);
  };

  const handleDelete = (id: string) => {
    setEmails(emails.filter((email) => email.id !== id));
  };

  const handleAddEmail = () => {
    const newEmail: Email = {
      id: Date.now().toString(),
      subject: "New Email",
      delay: 1,
      delayUnit: "days",
    };
    setEmails([...emails, newEmail]);
  };

  // Calculate the height for the connection line
  const connectionLineHeight =
    emails.length > 1 ? (emails.length - 1) * 96 + 32 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <motion.h2
          className="text-2xl font-bold text-foreground mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Email Campaign Flow
        </motion.h2>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Drag and drop to reorder your email sequence
        </motion.p>
      </div>

      <div className="relative">
        {/* Connection Line - Particle Stream Effect */}
        {emails.length > 1 && (
          <motion.div
            className="absolute top-0 w-0.5 pointer-events-none left-1/2 -translate-x-1/2"
            initial={{ height: 0 }}
            animate={{ height: connectionLineHeight }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
            }}
          >
            {/* Base line */}
            <div className="absolute inset-0 w-0.5 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />

            {/* Glow effect */}
            <div className="absolute inset-0 w-4 -left-[7px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-sm" />

            {/* Flowing particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 left-[-1.5px] bg-primary rounded-full shadow-[0_0_6px_var(--color-primary)]"
                animate={{
                  top: ["0%", "100%"],
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 1, 0.5],
                }}
                transition={{
                  duration: 2 + emails.length * 0.3,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "linear",
                }}
              />
            ))}
          </motion.div>
        )}

        <Reorder.Group
          axis="y"
          values={emails}
          onReorder={handleReorder}
          className="space-y-8"
        >
          {emails.map((email, index) => (
            <EmailCard
              key={email.id}
              email={email}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Reorder.Group>
      </div>

      <div className="flex items-center justify-center w-full my-6">
        <Button
          onClick={handleAddEmail}
          className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Email
        </Button>
      </div>
    </div>
  );
}
