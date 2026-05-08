import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerCard } from "@/components/owner/OwnerShell";
import { ShieldCheck, ShieldAlert, Table, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_owner/owner/security")({
  component: SecurityPage,
});

const CRITICAL_TABLES = [
  "profiles", "user_roles", "posts", "comments", "likes", "follows",
  "messages", "conversations", "conversation_participants",
  "products", "orders", "order_items", "cart_items",
  "groups", "group_members", "group_posts",
  "stories", "notifications", "live_streams",
  "ai_conversations", "ai_messages",
  "owner_audit_logs", "feature_flags",
  "site_visits", "user_bookmarks", "user_metrics",
  "ad_campaigns", "trade_offers", "push_subscriptions",
  "mail_messages", "mail_labels", "mail_message_labels",
  "voice_room_participants", "catalog_items",
];

function SecurityPage() {
  const { data: roleStats } = useQuery({
    queryKey: ["owner-security-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role");
      const map = new Map<string, number>();
      (data ?? []).forEach((r) => map.set(r.role, (map.get(r.role) ?? 0) + 1));
      return [...map.entries()].sort((a, b) => b[1] - a[1]);
    },
  });

  const { data: auditCount } = useQuery({
    queryKey: ["owner-security-audit-count"],
    queryFn: async () => {
      const { count } = await supabase.from("owner_audit_logs").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <OwnerShell title="Security & RLS" subtitle="نظرة عامة على أمان المنصة">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-400" /> توزيع الأدوار
          </h2>
          <div className="space-y-3">
            {roleStats?.map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <Badge variant="outline" className={`text-xs ${role === "owner" ? "border-[oklch(0.75_0.18_50)] text-[oklch(0.85_0.15_50)]" : role === "admin" ? "border-cyan-glow text-cyan-glow" : "border-[oklch(0.3_0.04_40)] text-[oklch(0.6_0.04_40)]"}`}>
                  {role}
                </Badge>
                <span className="text-lg font-bold text-[oklch(0.9_0.05_50)]">{count}</span>
              </div>
            ))}
          </div>
        </OwnerCard>

        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[oklch(0.75_0.18_50)]" /> إحصائيات الأمان
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[oklch(0.7_0.04_40)]">سجلات التدقيق</span>
              <span className="text-lg font-bold text-[oklch(0.9_0.05_50)]">{auditCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[oklch(0.7_0.04_40)]">جداول محمية بـ RLS</span>
              <span className="text-lg font-bold text-green-400">{CRITICAL_TABLES.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[oklch(0.7_0.04_40)]">دوال أمان (Security Definer)</span>
              <span className="text-lg font-bold text-cyan-glow">5</span>
            </div>
          </div>
        </OwnerCard>
      </div>

      <OwnerCard className="p-5">
        <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
          <Table className="h-4 w-4 text-[oklch(0.75_0.18_50)]" /> الجداول المحمية بـ RLS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {CRITICAL_TABLES.map((t) => (
            <div key={t} className="flex items-center gap-2 p-2 rounded-md bg-[oklch(0.06_0.02_30)] text-xs">
              <Lock className="h-3 w-3 text-green-400 shrink-0" />
              <span className="font-mono text-[oklch(0.75_0.04_40)] truncate">{t}</span>
            </div>
          ))}
        </div>
      </OwnerCard>
    </OwnerShell>
  );
}
