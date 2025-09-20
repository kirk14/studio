"use client";

import { cn } from "@/lib/utils";

type ProgressRingProps = {
  percentage: number;
  label: string;
  value: string;
  colorClass: string;
  glowClass: string;
};

export function ProgressRing({
  percentage,
  label,
  value,
  colorClass,
  glowClass,
}: ProgressRingProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full" width="120" height="120" viewBox="0 0 120 120">
          <circle
            className="text-muted/20"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className={cn("transition-all duration-1000 ease-in-out", colorClass)}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            transform="rotate(-90 60 60)"
            style={{
              filter: `drop-shadow(0 0 4px currentColor)`,
            }}
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className={cn("text-2xl font-bold", colorClass)}>{percentage}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
