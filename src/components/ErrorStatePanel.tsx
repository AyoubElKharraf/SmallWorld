import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { easeSmooth } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  variant?: "card" | "inline";
};

export function ErrorStatePanel({
  title,
  description,
  onRetry,
  isRetrying,
  className,
  variant = "card",
}: Props) {
  const shell =
    variant === "card"
      ? "rounded-2xl border border-destructive/25 bg-destructive/[0.06] p-6 text-center"
      : "rounded-xl border border-destructive/20 bg-muted/40 px-4 py-3 text-left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeSmooth }}
      className={cn(shell, className)}
      role="alert"
    >
      <div className={cn("flex gap-3", variant === "card" ? "flex-col items-center" : "items-start")}>
        <AlertCircle
          className={cn(
            "h-5 w-5 shrink-0 text-destructive",
            variant === "card" && "mx-auto"
          )}
          aria-hidden
        />
        <div className={cn("min-w-0 space-y-1", variant === "card" && "text-center")}>
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description ? (
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          ) : null}
        </div>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("mt-4", variant === "inline" && "mt-3")}
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden />
          )}
          <span className="ml-2">Réessayer</span>
        </Button>
      ) : null}
    </motion.div>
  );
}
