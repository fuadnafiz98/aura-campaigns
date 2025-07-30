import React from "react";
import { motion } from "framer-motion";

interface AnimatedProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  isHovered?: boolean;
}

export const AnimatedProgressRing = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color = "hsl(var(--primary))",
  isHovered = false,
}: AnimatedProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          animate={{
            strokeDashoffset: isHovered
              ? circumference // Hide the base circle when hovering
              : circumference - (progress / 100) * circumference, // Show full progress when not hovering
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        />
        {isHovered && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset:
                circumference - (progress / 100) * circumference,
            }}
            exit={{ strokeDashoffset: circumference }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
              type: "spring",
              stiffness: 60,
              damping: 15,
            }}
          />
        )}
      </svg>
      <motion.div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-lg font-bold text-foreground"
          animate={{
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {Math.round(progress)}%
        </motion.span>
      </motion.div>
    </div>
  );
};
