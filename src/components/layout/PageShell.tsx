import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "narrow" | "article" | "auth" | "lg" | "wide" | "flush";

const maxW: Record<Exclude<Variant, "flush">, string> = {
  default: "max-w-7xl",
  narrow: "max-w-lg",
  article: "max-w-3xl",
  auth: "max-w-md",
  lg: "max-w-5xl",
  wide: "max-w-6xl",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  /** Pas de padding vertical (sections full-bleed internes). */
  noVerticalPadding?: boolean;
};

export function PageShell({ children, variant = "default", className, noVerticalPadding }: Props) {
  if (variant === "flush") {
    return <div className={cn("w-full", className)}>{children}</div>;
  }

  return (
    <div
      className={cn(
        "mx-auto w-full px-6",
        maxW[variant],
        noVerticalPadding ? "" : "py-8 md:py-10",
        className
      )}
    >
      {children}
    </div>
  );
}
