import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedProgressRing } from "./animated-progress-ring";
import { AnimatedCounter } from "./animated-counter";

interface IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AnimatedStatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    ref?: React.Ref<IconHandle>;
  }>;
  iconColor: string;
  gradientFrom: string;
  showProgressRing?: boolean;
  progress?: number;
  progressColor?: string;
  children?: React.ReactNode;
}

export const AnimatedStatCard = ({
  title,
  value,
  subtitle,
  icon: IconComponent,
  iconColor,
  gradientFrom,
  showProgressRing = false,
  progress = 0,
  progressColor,
  children,
}: AnimatedStatCardProps) => {
  const iconRef = React.useRef<IconHandle>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Card
      className="bg-card border-border overflow-hidden relative hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => {
        iconRef.current?.startAnimation();
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        iconRef.current?.stopAnimation();
        setIsHovered(false);
      }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} to-transparent`}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={`p-2.5 ${iconColor} rounded-xl transition-colors duration-300`}
        >
          <IconComponent size={20} ref={iconRef} className="text-current" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {showProgressRing ? (
          <div className="flex items-center justify-between mb-4">
            <div>
              <div
                className={`text-3xl font-bold mb-1 ${iconColor.includes("emerald") ? "text-emerald-400" : iconColor.includes("blue") ? "text-blue-400" : iconColor.includes("red") ? "text-red-400" : iconColor.includes("amber") ? "text-amber-400" : "text-foreground"}`}
              >
                <AnimatedCounter value={value} />
              </div>
              {subtitle && (
                <div
                  className={`text-xs ${iconColor.includes("emerald") ? "text-emerald-400/70" : iconColor.includes("blue") ? "text-blue-400/70" : iconColor.includes("red") ? "text-red-400/70" : iconColor.includes("amber") ? "text-amber-400/70" : "text-muted-foreground"}`}
                >
                  {subtitle}
                </div>
              )}
            </div>
            {progressColor && (
              <AnimatedProgressRing
                progress={progress}
                size={60}
                strokeWidth={6}
                color={progressColor}
                isHovered={isHovered}
              />
            )}
          </div>
        ) : (
          <div>
            <div className="text-3xl font-bold text-foreground mb-2">
              <AnimatedCounter value={value} />
            </div>
            {subtitle && (
              <div className="text-xs text-muted-foreground">{subtitle}</div>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
};
