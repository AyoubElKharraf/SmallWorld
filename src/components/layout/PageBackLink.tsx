import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  to: string;
  children: React.ReactNode;
  className?: string;
};

export function PageBackLink({ to, children, className }: Props) {
  return (
    <Link
      to={to}
      className={cn(
        "mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
