import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bell, Check, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type NotifRow = {
  id: number;
  title: string;
  body: string;
  type: string;
  is_read: number | boolean;
  action_url: string | null;
  created_at: string;
};

const fetchNotifs = async () => {
  const r = await apiFetch("/api/notifications");
  if (r.status === 401) return { notifications: [] as NotifRow[], unreadCount: 0 };
  if (!r.ok) throw new Error("notifications");
  return r.json() as Promise<{ notifications: NotifRow[]; unreadCount: number }>;
};

type NavVariant = "hero" | "solid";

const NotificationBell = ({ navVariant = "hero" }: { navVariant?: NavVariant }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const btnNav =
    navVariant === "solid"
      ? "text-foreground hover:bg-muted"
      : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10";
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifs,
    enabled: !!user,
    refetchInterval: 45_000,
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      const r = await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (!r.ok) throw new Error();
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const r = await apiFetch("/api/notifications/read-all", { method: "POST" });
      if (!r.ok) throw new Error();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (!user) return null;

  const list = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${btnNav}`} aria-label={t("nav.notifications")}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] rounded-full bg-accent text-[10px] font-semibold text-accent-foreground flex items-center justify-center px-0.5">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>{t("nav.notifications")}</span>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs font-normal"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              {t("notif.markAllRead")}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground px-2 py-4 text-center">{t("notif.empty")}</p>
        ) : (
          <ScrollArea className="h-[min(60vh,320px)]">
            <div className="pr-2 space-y-1">
              {list.map((n) => {
                const read = Boolean(n.is_read);
                return (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-stretch gap-1 p-3 cursor-default focus:bg-muted"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-medium text-sm ${read ? "text-muted-foreground" : ""}`}>
                        {n.title}
                      </span>
                      {!read && (
                        <button
                          type="button"
                          className="shrink-0 text-accent hover:opacity-80"
                          aria-label={t("notif.markRead")}
                          onClick={() => markRead.mutate(n.id)}
                          disabled={markRead.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug whitespace-pre-wrap">
                      {n.body}
                    </p>
                    {n.action_url ? (
                      /^https?:\/\//i.test(n.action_url) ? (
                        <a
                          href={n.action_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                          onClick={() => markRead.mutate(n.id)}
                        >
                          {t("notif.openLink")}
                          <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      ) : (
                        <Link
                          to={n.action_url}
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                          onClick={() => markRead.mutate(n.id)}
                        >
                          {t("notif.openLink")}
                          <ExternalLink className="h-3 w-3" aria-hidden />
                        </Link>
                      )
                    ) : null}
                    <span className="text-[10px] text-muted-foreground/80">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
