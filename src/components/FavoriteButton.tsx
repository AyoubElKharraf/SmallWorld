import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

async function fetchFavoriteKeys(): Promise<{ targets: string[] }> {
  const r = await apiFetch("/api/favorites/keys");
  if (r.status === 401) return { targets: [] };
  if (!r.ok) throw new Error("favorites");
  return r.json();
}

type Props = {
  targetKey: string;
  className?: string;
  size?: "sm" | "icon";
};

export function FavoriteButton({ targetKey, className, size = "icon" }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["favorites", "keys"],
    queryFn: fetchFavoriteKeys,
    enabled: !!user,
  });

  const active = (data?.targets ?? []).includes(targetKey);

  const toggle = useMutation({
    mutationFn: async () => {
      if (active) {
        const r = await apiFetch("/api/favorites", {
          method: "DELETE",
          body: JSON.stringify({ targetKey }),
        });
        if (!r.ok) throw new Error();
        return;
      }
      const r = await apiFetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ targetKey }),
      });
      if (!r.ok) throw new Error();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  if (!user) return null;

  return (
    <motion.div
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className={cn("inline-flex", className)}
    >
      <Button
        type="button"
        variant="secondary"
        size={size}
        className={cn(
          "shrink-0 rounded-full border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm hover:bg-card",
          active && "text-accent"
        )}
        aria-pressed={active}
        aria-label={active ? t("favorites.remove") : t("favorites.add")}
        disabled={toggle.isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle.mutate();
        }}
      >
        <motion.span
          key={active ? "on" : "off"}
          initial={{ scale: 0.75 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
        >
          <Heart className={cn("h-4 w-4", active && "fill-accent")} aria-hidden />
        </motion.span>
      </Button>
    </motion.div>
  );
}
