import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  /** Alignement des boutons (ex. formulaire en colonne sur mobile). */
  direction?: "row" | "col";
};

/** Rangée de boutons / actions cohérente sur toutes les pages. */
export function ActionBar({ children, className, direction = "row" }: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 sm:gap-3",
        direction === "col" ? "flex-col items-stretch sm:flex-row sm:items-center" : "items-center",
        className
      )}
    >
      {children}
    </div>
  );
}
