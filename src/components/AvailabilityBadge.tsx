import { cn } from "@/lib/utils";
import { availabilityTone } from "@/lib/destinations-data";

type Props = { label?: string; className?: string };

export function AvailabilityBadge({ label, className }: Props) {
  const tone = availabilityTone(label);
  const toneCls = {
    ok: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
    warn: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
    alert: "bg-rose-500/15 text-rose-900 dark:text-rose-200",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  const text = label?.trim();
  return (
    <span
      className={cn(
        "inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-xs font-medium",
        toneCls,
        className
      )}
      title={text}
    >
      {text ?? "—"}
    </span>
  );
}
