import React from "react";
import { AnimatedBar } from "./animated-bar";

interface StatusItemProps {
  label: string;
  value: number;
  color: string;
  progress: number;
}

export const StatusItem = ({
  label,
  value,
  color,
  progress,
}: StatusItemProps) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="space-y-2 cursor-pointer transition-all duration-200 hover:bg-muted/50 p-2 -m-2 rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
      <AnimatedBar progress={progress} color={color} isHovered={isHovered} />
    </div>
  );
};
