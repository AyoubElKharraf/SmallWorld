import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div
      className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 text-muted-foreground"
      role="status"
      aria-live="polite"
      aria-label="Chargement de la page"
    >
      <Loader2 className="h-10 w-10 animate-spin" aria-hidden />
      <span className="text-sm">Chargement…</span>
    </div>
  );
}
