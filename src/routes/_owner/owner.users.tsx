import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { OwnerShell, OwnerCard, OwnerStat } from "@/components/owner/OwnerShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search, Users, UserCheck, Shield, Crown, Loader2, ChevronLeft, ChevronRight,
  Eye, Activity, Ban, CheckCircle, XCircle, Filter, Hash, Copy,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_owner/owner/users")({
  component: UsersPage,
});

const PAGE_SIZE = 20;

function UsersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_desc");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: stats } = useQuery({
    queryKey: ["owner-user-stats"],
    queryFn: async () => {
      const [total, verified, online, admins] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_verified", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_online", true),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin"),
      ]);
      return { total: total.count ?? 0, verified: verified.count ?? 0, online: online.count ?? 0, admins: admins.count ?? 0 };
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["owner-all-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id, role");
      const map = new Map<string, string[]>();
      (data ?? []).forEach((r) => {
        const arr = map.get(r.user_id) ?? [];
        arr.push(r.role);
        map.set(r.user_id, arr);
      });
      return map;
    },
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["owner-users", search, page, roleFilter, verifiedFilter],
    queryFn: async () => {
      let q = supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search.trim()) q = q.or(`username.ilike.%${search.trim()}%,full_name.ilike.%${search.trim()}%`);
      if (verifiedFilter === "yes") q = q.eq("is_verified", true);
      else if (verifiedFilter === "no") q = q.eq("is_verified", false);
      const { data, count } = await q;

      let filtered = data ?? [];
      // Client-side role filter (since roles are in separate table)
      if (roleFilter !== "all" && roles) {
        filtered = filtered.filter((u) => {
          const userRoles = roles.get(u.id) ?? [];
          return userRoles.includes(roleFilter);
        });
      }

      return { users: filtered, total: count ?? 0 };
    },
  });

  // User activity log
  const { data: userLogs } = useQuery({
    queryKey: ["owner-user-activity", selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      const { data } = await supabase.from("owner_audit_logs")
        .select("*")
        .eq("target_id", selectedUser.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  // User posts count
  const { data: userStats } = useQuery({
    queryKey: ["owner-user-detail-stats", selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      const [posts, comments, likes] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", selectedUser.id),
        supabase.from("comments").select("*", { count: "exact", head: true }).eq("user_id", selectedUser.id),
        supabase.from("likes").select("*", { count: "exact", head: true }).eq("user_id", selectedUser.id),
      ]);
      return { posts: posts.count ?? 0, comments: comments.count ?? 0, likes: likes.count ?? 0 };
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_verified: verified }).eq("id", id);
      if (error) throw error;
      await supabase.from("owner_audit_logs").insert({
        actor_id: user!.id, action: verified ? "user.verify" : "user.unverify",
        target_type: "user", target_id: id,
      });
    },
    onSuccess: () => { toast.success("تم التحديث"); qc.invalidateQueries({ queryKey: ["owner-users"] }); qc.invalidateQueries({ queryKey: ["owner-user-stats"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role, action }: { userId: string; role: string; action: "add" | "remove" }) => {
      if (action === "add") {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
        if (error) throw error;
      }
      await supabase.from("owner_audit_logs").insert({
        actor_id: user!.id, action: `role.${action}`, target_type: "user_role",
        target_id: userId, metadata: { role },
      });
    },
    onSuccess: () => { toast.success("تم تحديث الدور"); qc.invalidateQueries({ queryKey: ["owner-all-roles"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const totalPages = Math.ceil((usersData?.total ?? 0) / PAGE_SIZE);

  return (
    <OwnerShell title="User Operations" subtitle="إدارة المستخدمين والأدوار والتحقق">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <OwnerStat label="إجمالي المستخدمين" value={stats?.total ?? "—"} icon={Users} accent="amber" />
        <OwnerStat label="موثقون" value={stats?.verified ?? "—"} icon={UserCheck} accent="cyan" />
        <OwnerStat label="متصلون الآن" value={stats?.online ?? "—"} icon={Shield} accent="rose" />
        <OwnerStat label="المشرفون" value={stats?.admins ?? "—"} icon={Crown} accent="amber" />
      </div>

      {/* Search & Filters */}
      <OwnerCard className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.5_0.04_40)]" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="بحث بالاسم أو اسم المستخدم..."
              className="pr-9 bg-transparent border-[oklch(0.18_0.04_30)] text-[oklch(0.9_0.05_50)] placeholder:text-[oklch(0.4_0.04_40)]"
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
              <SelectTrigger className="w-32 bg-transparent border-[oklch(0.18_0.04_30)] text-[oklch(0.8_0.04_40)] text-xs">
                <Filter className="h-3 w-3 ml-1" />
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأدوار</SelectItem>
                <SelectItem value="owner">مالك</SelectItem>
                <SelectItem value="admin">مشرف</SelectItem>
                <SelectItem value="user">مستخدم</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={(v) => { setVerifiedFilter(v); setPage(0); }}>
              <SelectTrigger className="w-32 bg-transparent border-[oklch(0.18_0.04_30)] text-[oklch(0.8_0.04_40)] text-xs">
                <SelectValue placeholder="التوثيق" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="yes">موثق</SelectItem>
                <SelectItem value="no">غير موثق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </OwnerCard>

      {/* Users Table */}
      <OwnerCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-[oklch(0.75_0.18_50)] mx-auto" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[oklch(0.55_0.04_40)] text-xs uppercase tracking-wider border-b border-[oklch(0.15_0.03_30)]">
                    <th className="text-right p-3">المستخدم</th>
                    <th className="text-right p-3">الأدوار</th>
                    <th className="text-center p-3">موثق</th>
                    <th className="text-right p-3">الدولة</th>
                    <th className="text-right p-3">المنشورات</th>
                    <th className="text-right p-3">الانضمام</th>
                    <th className="text-center p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[oklch(0.12_0.03_30)]">
                  {usersData?.users.map((u) => {
                    const userRoles = roles?.get(u.id) ?? [];
                    const isOwnerUser = userRoles.includes("owner");
                    return (
                      <tr key={u.id} className="hover:bg-[oklch(0.08_0.02_30)] transition cursor-pointer" onClick={() => setSelectedUser(u)}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.avatar_url ?? undefined} />
                              <AvatarFallback className="bg-[oklch(0.15_0.04_30)] text-[oklch(0.7_0.04_40)] text-xs">
                                {(u.username ?? "?").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-[oklch(0.9_0.05_50)] flex items-center gap-1">
                                @{u.username}
                                {u.is_online && <span className="h-2 w-2 rounded-full bg-green-400 inline-block" />}
                              </div>
                              <div className="text-xs text-[oklch(0.5_0.04_40)]">{u.full_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {userRoles.map((r) => (
                              <Badge key={r} variant="outline" className={`text-[10px] ${r === "owner" ? "border-[oklch(0.75_0.18_50)] text-[oklch(0.85_0.15_50)]" : r === "admin" ? "border-cyan-glow text-cyan-glow" : "border-[oklch(0.3_0.04_40)] text-[oklch(0.6_0.04_40)]"}`}>
                                {r === "owner" && <Crown className="h-3 w-3 ml-1" />}
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={u.is_verified}
                            onCheckedChange={(v) => verifyMutation.mutate({ id: u.id, verified: v })}
                          />
                        </td>
                        <td className="p-3 text-[oklch(0.7_0.04_40)]">{u.country_code ?? "—"}</td>
                        <td className="p-3 text-[oklch(0.7_0.04_40)]">{u.posts_count}</td>
                        <td className="p-3 text-xs text-[oklch(0.5_0.04_40)]">{formatDistanceToNow(new Date(u.created_at))} ago</td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          {!isOwnerUser && (
                            <div className="flex justify-center gap-1">
                              {!userRoles.includes("admin") ? (
                                <Button size="sm" variant="ghost" className="text-xs text-cyan-glow hover:bg-cyan-glow/10 h-7"
                                  onClick={() => roleMutation.mutate({ userId: u.id, role: "admin", action: "add" })}>
                                  + Admin
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" className="text-xs text-destructive hover:bg-destructive/10 h-7"
                                  onClick={() => roleMutation.mutate({ userId: u.id, role: "admin", action: "remove" })}>
                                  − Admin
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-xs h-7 p-1" onClick={() => setSelectedUser(u)}>
                                <Eye className="h-3.5 w-3.5 text-[oklch(0.6_0.04_40)]" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-[oklch(0.15_0.03_30)]">
                <span className="text-xs text-[oklch(0.5_0.04_40)]">{usersData?.total} مستخدم</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-[oklch(0.6_0.04_40)] self-center px-2">{page + 1}/{totalPages}</span>
                  <Button size="sm" variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </OwnerCard>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-lg bg-[oklch(0.06_0.02_30)] border-[oklch(0.18_0.04_30)] text-[oklch(0.9_0.05_50)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedUser?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-[oklch(0.15_0.04_30)]">
                  {(selectedUser?.username ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-bold">@{selectedUser?.username}</div>
                <div className="text-xs text-[oklch(0.55_0.04_40)] font-normal">{selectedUser?.full_name} · {selectedUser?.country_code ?? "—"}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="text-center p-3 rounded-lg bg-[oklch(0.08_0.02_30)]">
              <div className="text-lg font-bold text-[oklch(0.9_0.05_50)]">{userStats?.posts ?? "—"}</div>
              <div className="text-[10px] text-[oklch(0.5_0.04_40)]">منشورات</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[oklch(0.08_0.02_30)]">
              <div className="text-lg font-bold text-[oklch(0.9_0.05_50)]">{userStats?.comments ?? "—"}</div>
              <div className="text-[10px] text-[oklch(0.5_0.04_40)]">تعليقات</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[oklch(0.08_0.02_30)]">
              <div className="text-lg font-bold text-[oklch(0.9_0.05_50)]">{userStats?.likes ?? "—"}</div>
              <div className="text-[10px] text-[oklch(0.5_0.04_40)]">إعجابات</div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2 mt-2 text-sm">
            <div className="flex justify-between p-2 rounded bg-[oklch(0.08_0.02_30)]">
              <span className="text-[oklch(0.55_0.04_40)]">الانضمام</span>
              <span>{selectedUser ? new Date(selectedUser.created_at).toLocaleDateString("ar") : "—"}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[oklch(0.08_0.02_30)]">
              <span className="text-[oklch(0.55_0.04_40)]">المتابعون</span>
              <span>{selectedUser?.followers_count ?? 0}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-[oklch(0.08_0.02_30)]">
              <span className="text-[oklch(0.55_0.04_40)]">يتابع</span>
              <span>{selectedUser?.following_count ?? 0}</span>
            </div>
          </div>

          {/* Activity Log */}
          <div className="mt-3">
            <h3 className="text-xs font-semibold text-[oklch(0.7_0.04_40)] mb-2 flex items-center gap-1">
              <Activity className="h-3 w-3" /> سجل النشاط الإداري
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {userLogs?.length === 0 && (
                <p className="text-xs text-[oklch(0.45_0.04_40)] text-center py-3">لا توجد سجلات</p>
              )}
              {userLogs?.map((log) => (
                <div key={log.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-[oklch(0.08_0.02_30)]">
                  <span className="font-mono text-[oklch(0.7_0.1_50)]">{log.action}</span>
                  <span className="text-[oklch(0.4_0.04_40)] mr-auto">{formatDistanceToNow(new Date(log.created_at))} ago</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </OwnerShell>
  );
}
