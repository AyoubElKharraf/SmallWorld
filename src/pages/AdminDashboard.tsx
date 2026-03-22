import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SkipLink } from "@/components/SkipLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type Stats = { clients: number; admins: number; searches: number; notifications: number };

type UserRow = { id: number; email: string; name: string; role: string; created_at: string };

type SearchRow = {
  id: number;
  query_text: string;
  created_at: string;
  user_id: number | null;
  user_email: string | null;
  user_name: string | null;
};

type Paginated<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const PAGE_SIZE = 25;

const AdminDashboard = () => {
  const qc = useQueryClient();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("info");
  const [broadcast, setBroadcast] = useState(true);
  const [targetUserId, setTargetUserId] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const r = await apiFetch("/api/admin/stats");
      if (!r.ok) throw new Error();
      return r.json() as Promise<Stats>;
    },
  });

  const { data: usersRes } = useQuery({
    queryKey: ["admin", "users", userPage],
    queryFn: async () => {
      const r = await apiFetch(`/api/admin/users?page=${userPage}&limit=${PAGE_SIZE}`);
      if (!r.ok) throw new Error();
      return r.json() as Promise<Paginated<UserRow>>;
    },
  });

  const { data: searchesRes } = useQuery({
    queryKey: ["admin", "searches", searchPage],
    queryFn: async () => {
      const r = await apiFetch(`/api/admin/searches?page=${searchPage}&limit=${PAGE_SIZE}`);
      if (!r.ok) throw new Error();
      return r.json() as Promise<Paginated<SearchRow>>;
    },
  });

  const sendNotif = useMutation({
    mutationFn: async () => {
      const r = await apiFetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({
          title: title || t("admin.notifDefaultTitle"),
          body,
          type,
          broadcastToAll: broadcast,
          userId: broadcast ? undefined : Number(targetUserId),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Erreur");
      return data as { sent: number };
    },
    onSuccess: (d) => {
      toast.success(t("admin.sentToast", { count: d.sent }));
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      setBody("");
    },
    onError: () => toast.error(t("admin.sendError")),
  });

  const exportCsv = async () => {
    try {
      const r = await apiFetch("/api/admin/searches/export");
      if (!r.ok) throw new Error();
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "voyageur-recherches.csv";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("admin.exportError"));
    }
  };

  const users = usersRes?.data ?? [];
  const searches = searchesRes?.data ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SkipLink />
      <Navbar variant="solid" />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10 outline-none">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">{t("admin.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("admin.subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            [t("admin.statClients"), stats?.clients ?? "—"],
            [t("admin.statAdmins"), stats?.admins ?? "—"],
            [t("admin.statSearches"), stats?.searches ?? "—"],
            [t("admin.statNotifications"), stats?.notifications ?? "—"],
          ].map(([label, val]) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{val}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.sendNotifTitle")}</CardTitle>
            <CardDescription>
              <Trans i18nKey="admin.sendNotifDesc" components={{ strong: <strong /> }} />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="n-title">{t("admin.labelTitle")}</Label>
              <Input
                id="n-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("admin.notifDefaultTitle")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="n-body">{t("admin.labelBody")}</Label>
              <Textarea
                id="n-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("admin.placeholderBody")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.labelType")}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">{t("admin.typeInfo")}</SelectItem>
                  <SelectItem value="success">{t("admin.typeSuccess")}</SelectItem>
                  <SelectItem value="warning">{t("admin.typeWarning")}</SelectItem>
                  <SelectItem value="error">{t("admin.typeError")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="bc"
                checked={broadcast}
                onCheckedChange={(c) => setBroadcast(c === true)}
              />
              <Label htmlFor="bc" className="font-normal cursor-pointer">
                {t("admin.broadcast")}
              </Label>
            </div>
            {!broadcast && (
              <div className="space-y-2">
                <Label htmlFor="uid">{t("admin.userId")}</Label>
                <Input
                  id="uid"
                  type="number"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder={t("admin.userIdPlaceholder")}
                />
              </div>
            )}
            <Button onClick={() => sendNotif.mutate()} disabled={sendNotif.isPending || !body.trim()}>
              {sendNotif.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden />
                  {t("admin.sending")}
                </>
              ) : (
                t("admin.send")
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{t("admin.searchesTitle")}</CardTitle>
              <CardDescription>{t("admin.searchesDesc")}</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void exportCsv()}>
              {t("admin.exportCsv")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.colDate")}</TableHead>
                  <TableHead>{t("admin.colQuery")}</TableHead>
                  <TableHead>{t("admin.colUser")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searches.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{s.query_text}</TableCell>
                    <TableCell>
                      {s.user_email ? (
                        <span>
                          {s.user_name} <span className="text-muted-foreground">({s.user_email})</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{t("admin.guest")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {searchesRes && searchesRes.totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                <span>
                  {t("admin.page")} {searchesRes.page} {t("admin.of")} {searchesRes.totalPages} ({searchesRes.total})
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={searchPage <= 1}
                    onClick={() => setSearchPage((p) => Math.max(1, p - 1))}
                  >
                    {t("admin.prev")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={searchPage >= searchesRes.totalPages}
                    onClick={() => setSearchPage((p) => p + 1)}
                  >
                    {t("admin.next")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.usersTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.colId")}</TableHead>
                  <TableHead>{t("admin.colEmail")}</TableHead>
                  <TableHead>{t("admin.colName")}</TableHead>
                  <TableHead>{t("admin.colRole")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="tabular-nums">{u.id}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {usersRes && usersRes.totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                <span>
                  {t("admin.page")} {usersRes.page} {t("admin.of")} {usersRes.totalPages} ({usersRes.total})
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  >
                    {t("admin.prev")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={userPage >= usersRes.totalPages}
                    onClick={() => setUserPage((p) => p + 1)}
                  >
                    {t("admin.next")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
