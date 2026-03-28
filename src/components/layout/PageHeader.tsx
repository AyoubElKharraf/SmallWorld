import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "default" | "hero";

type Props = {
  /** Id sur le &lt;h1&gt; (aria-labelledby, ancres). */
  titleId?: string;
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  /** Boutons ou liens alignés à droite sur desktop. */
  actions?: ReactNode;
  align?: "left" | "center";
  size?: Size;
  className?: string;
};

export function PageHeader({
  titleId,
  kicker,
  title,
  description,
  icon: Icon,
  iconClassName,
  actions,
  align = "left",
  size = "default",
  className,
}: Props) {
  const isCenter = align === "center";
  const titleCls =
    size === "hero"
      ? "font-serif text-4xl leading-[1.1] text-balance text-foreground md:text-5xl"
      : "font-serif text-3xl tracking-tight text-foreground md:text-4xl";

  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-4 md:mb-10",
        !isCenter && actions && "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn(isCenter && "text-center", !isCenter && "min-w-0 flex-1")}>
        {Icon && (
          <div
            className={cn(
              "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15",
              isCenter && "mx-auto"
            )}
          >
            <Icon className={cn("h-6 w-6", iconClassName)} aria-hidden />
          </div>
        )}
        {kicker && (
          <p
            className={cn(
              "mb-2 text-sm font-medium uppercase tracking-[0.15em] text-accent",
              isCenter && "mx-auto max-w-xl"
            )}
          >
            {kicker}
          </p>
        )}
        <h1 id={titleId} className={cn(titleCls, isCenter && "mx-auto max-w-3xl")}>
          {title}
        </h1>
        {description && (
          <div
            className={cn(
              "mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base",
              isCenter && "mx-auto",
              !isCenter && "mt-3"
            )}
          >
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div
          className={cn(
            "flex flex-shrink-0 flex-wrap items-center gap-2 sm:gap-3",
            isCenter && "justify-center",
            !isCenter && "md:justify-end"
          )}
        >
          {actions}
        </div>
      )}
    </header>
  );
}
