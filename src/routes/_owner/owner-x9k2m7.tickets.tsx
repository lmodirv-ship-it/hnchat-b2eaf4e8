import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { OwnerShell, OwnerCard, OwnerStat } from "@/components/owner/OwnerShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_owner/owner-x9k2m7/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["owner-tickets", statusFilter],
    queryFn: async () => {
      let q = supabase.from("support_tickets" as any).select("*").order("created_at", { ascending: false }).limit(100);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data: tickets } = await q;
      const allTickets = tickets ?? [];

      // Get profiles for users
      const userIds = [...new Set(allTickets.map((t) => t.user_id))];
      let profileMap = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, username").in("id", userIds);
        profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      }

      const open = allTickets.filter((t) => t.status === "open").length;
      const inProgress = allTickets.filter((t) => t.status === "in_progress").length;
      const resolved = allTickets.filter((t) => t.status === "resolved").length;

      return {
        tickets: allTickets.map((t) => ({ ...t, profile: profileMap.get(t.user_id) })),
        open, inProgress, resolved, total: allTickets.length,
      };
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "resolved") updates.resolved_at = new Date().toISOString();
      if (status === "in_progress") updates.assigned_to = user!.id;
      const { error } = await supabase.from("support_tickets" as any).update(updates).eq("id", id);
      if (error) throw error;
      await supabase.from("owner_audit_logs").insert({
        actor_id: user!.id,
        action: `ticket.${status}`,
        target_type: "support_ticket",
        target_id: id,
      });
    },
    onSuccess: () => {
      toast.success("تم التحديث");
      qc.invalidateQueries({ queryKey: ["owner-tickets"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const statusColors: Record<string, string> = {
    open: "border-yellow-500 text-yellow-400",
    in_progress: "border-blue-500 text-blue-400",
    resolved: "border-green-500 text-green-400",
    closed: "border-[oklch(0.4_0.04_40)] text-[oklch(0.5_0.04_40)]",
  };

  const priorityColors: Record<string, string> = {
    low: "text-[oklch(0.5_0.04_40)]",
    medium: "text-yellow-400",
    high: "text-orange-400",
    urgent: "text-red-400",
  };

  return (
    <OwnerShell title="Support Tickets" subtitle="إدارة تذاكر الدعم الفني">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <OwnerStat label="مفتوحة" value={data?.open ?? "—"} icon={AlertCircle} accent="amber" />
        <OwnerStat label="قيد المعالجة" value={data?.inProgress ?? "—"} icon={Clock} accent="cyan" />
        <OwnerStat label="محلولة" value={data?.resolved ?? "—"} icon={CheckCircle} accent="cyan" />
        <OwnerStat label="الإجمالي" value={data?.total ?? "—"} icon={LifeBuoy} accent="rose" />
      </div>

      {/* Filter */}
      <OwnerCard className="p-4 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-transparent border-[oklch(0.18_0.04_30)] text-[oklch(0.8_0.04_40)] text-xs">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="open">مفتوحة</SelectItem>
            <SelectItem value="in_progress">قيد المعالجة</SelectItem>
            <SelectItem value="resolved">محلولة</SelectItem>
            <SelectItem value="closed">مغلقة</SelectItem>
          </SelectContent>
        </Select>
      </OwnerCard>

      {/* Tickets Table */}
      {isLoading ? (
        <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-[oklch(0.75_0.18_50)] mx-auto" /></div>
      ) : (
        <OwnerCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[oklch(0.55_0.04_40)] text-xs uppercase tracking-wider border-b border-[oklch(0.15_0.03_30)]">
                  <th className="text-right p-3">الموضوع</th>
                  <th className="text-right p-3">المستخدم</th>
                  <th className="text-center p-3">الأولوية</th>
                  <th className="text-center p-3">الحالة</th>
                  <th className="text-right p-3">الوقت</th>
                  <th className="text-center p-3">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(0.12_0.03_30)]">
                {data?.tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-[oklch(0.08_0.02_30)] transition">
                    <td className="p-3">
                      <div className="text-[oklch(0.88_0.04_50)] font-medium">{t.subject}</div>
                      <div className="text-xs text-[oklch(0.5_0.04_40)] mt-0.5 truncate max-w-[300px]">{t.description}</div>
                    </td>
                    <td className="p-3 text-[oklch(0.7_0.04_40)]">@{t.profile?.username ?? "—"}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs font-medium ${priorityColors[t.priority] ?? ""}`}>{t.priority}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={`text-[10px] ${statusColors[t.status] ?? ""}`}>{t.status}</Badge>
                    </td>
                    <td className="p-3 text-xs text-[oklch(0.5_0.04_40)]">{formatDistanceToNow(new Date(t.created_at))} ago</td>
                    <td className="p-3 text-center">
                      {t.status === "open" && (
                        <Button size="sm" variant="ghost" className="text-xs text-blue-400 hover:bg-blue-400/10 h-7"
                          onClick={() => updateStatus.mutate({ id: t.id, status: "in_progress" })}>
                          معالجة
                        </Button>
                      )}
                      {t.status === "in_progress" && (
                        <Button size="sm" variant="ghost" className="text-xs text-green-400 hover:bg-green-400/10 h-7"
                          onClick={() => updateStatus.mutate({ id: t.id, status: "resolved" })}>
                          حل
                        </Button>
                      )}
                      {t.status === "resolved" && (
                        <Button size="sm" variant="ghost" className="text-xs text-[oklch(0.5_0.04_40)] hover:bg-[oklch(0.1_0.03_40)] h-7"
                          onClick={() => updateStatus.mutate({ id: t.id, status: "closed" })}>
                          إغلاق
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.tickets.length === 0 && <div className="p-8 text-center text-[oklch(0.5_0.04_40)]">لا توجد تذاكر</div>}
        </OwnerCard>
      )}
    </OwnerShell>
  );
}
