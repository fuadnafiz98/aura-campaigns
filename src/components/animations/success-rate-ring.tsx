import React from "react";
import { AnimatedProgressRing } from "./animated-progress-ring";

interface SuccessRateRingProps {
  progress: number;
}

export const SuccessRateRing = ({ progress }: SuccessRateRingProps) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatedProgressRing
        progress={progress}
        size={120}
        strokeWidth={8}
        color="rgb(52, 211, 153)"
        isHovered={isHovered}
      />
      <h3 className="text-sm font-medium text-muted-foreground mt-3">
        Success Rate
      </h3>
    </div>
  );
};
