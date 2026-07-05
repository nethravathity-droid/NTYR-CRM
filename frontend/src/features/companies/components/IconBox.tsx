import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneStyles = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400",
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400",
  violet:
    "bg-violet-100 text-violet-600 dark:bg-violet-950/80 dark:text-violet-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400",
  cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/80 dark:text-cyan-400",
  indigo:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400",
} as const;

export type IconBoxTone = keyof typeof toneStyles;

interface IconBoxProps {
  icon: LucideIcon;
  tone?: IconBoxTone;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function IconBox({
  icon: Icon,
  tone = "blue",
  size = "md",
  className,
}: IconBoxProps) {
  const sizeClass =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        sizeClass,
        toneStyles[tone],
        className,
      )}
    >
      <Icon className={iconSize} />
    </div>
  );
}
