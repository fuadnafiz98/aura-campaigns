import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedBarProps {
  progress: number;
  color: string;
  isHovered?: boolean;
}

export const AnimatedBar = ({
  progress,
  color,
  isHovered = false,
}: AnimatedBarProps) => {
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: `${Math.min(progress, 100)}%` }}
        animate={{
          width: isHovered
            ? [`0%`, `${Math.min(progress, 100)}%`]
            : `${Math.min(progress, 100)}%`,
        }}
        transition={{
          duration: isHovered ? 1.2 : 0.8,
          ease: "easeOut",
          type: "spring",
          stiffness: 60,
          damping: 15,
        }}
      />
    </div>
  );
};
