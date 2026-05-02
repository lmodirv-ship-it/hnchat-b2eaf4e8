// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerCard, OwnerStat } from "@/components/owner/OwnerShell";
import { Cpu, TrendingUp, Zap, Users, Loader2 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_owner/owner-x9k2m7/api-usage")({
  component: ApiUsagePage,
});

function ApiUsagePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["owner-api-usage"],
    queryFn: async () => {
      const { data: logs } = await supabase
        .from("usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      const allLogs = logs ?? [];
      const totalTokens = allLogs.reduce((s, l) => s + (l.tokens_used ?? 0), 0);
      const totalCost = allLogs.reduce((s, l) => s + Number(l.cost ?? 0), 0);

      // Group by day (last 14 days)
      const now = Date.now();
      const dayMap = new Map<string, { tokens: number; requests: number; cost: number }>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
        dayMap.set(d, { tokens: 0, requests: 0, cost: 0 });
      }
      allLogs.forEach((l) => {
        const day = l.created_at.slice(0, 10);
        if (dayMap.has(day)) {
          const v = dayMap.get(day)!;
          v.tokens += l.tokens_used ?? 0;
          v.requests += 1;
          v.cost += Number(l.cost ?? 0);
        }
      });
      const chartData = [...dayMap.entries()].map(([date, v]) => ({
        date: date.slice(5),
        ...v,
      }));

      // Top users by tokens
      const userMap = new Map<string, { tokens: number; requests: number }>();
      allLogs.forEach((l) => {
        const u = userMap.get(l.user_id) ?? { tokens: 0, requests: 0 };
        u.tokens += l.tokens_used ?? 0;
        u.requests += 1;
        userMap.set(l.user_id, u);
      });
      const topUserIds = [...userMap.entries()].sort((a, b) => b[1].tokens - a[1].tokens).slice(0, 10);

      // Fetch profiles for top users
      let topUsers: any[] = [];
      if (topUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .in("id", topUserIds.map(([id]) => id));
        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
        topUsers = topUserIds.map(([id, stats]) => ({
          ...stats,
          ...(profileMap.get(id) ?? { username: id.slice(0, 8) }),
          user_id: id,
        }));
      }

      // Model distribution
      const modelMap = new Map<string, number>();
      allLogs.forEach((l) => {
        const m = l.model ?? "unknown";
        modelMap.set(m, (modelMap.get(m) ?? 0) + 1);
      });
      const modelData = [...modelMap.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

      return {
        totalTokens,
        totalCost,
        totalRequests: allLogs.length,
        uniqueUsers: userMap.size,
        chartData,
        topUsers,
        modelData,
        recentLogs: allLogs.slice(0, 20),
      };
    },
  });

  if (isLoading) {
    return (
      <OwnerShell title="API & Token Usage" subtitle="مراقبة استهلاك AI وموارد API">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[oklch(0.75_0.18_50)]" />
        </div>
      </OwnerShell>
    );
  }

  return (
    <OwnerShell title="API & Token Usage" subtitle="مراقبة استهلاك AI وموارد API">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <OwnerStat label="إجمالي الرموز" value={data!.totalTokens.toLocaleString()} icon={Zap} accent="amber" />
        <OwnerStat label="التكلفة" value={`$${data!.totalCost.toFixed(2)}`} icon={TrendingUp} accent="rose" />
        <OwnerStat label="الطلبات" value={data!.totalRequests} icon={Cpu} accent="cyan" />
        <OwnerStat label="مستخدمون نشطون" value={data!.uniqueUsers} icon={Users} accent="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400" /> استهلاك الرموز (14 يوم)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data!.chartData}>
              <defs>
                <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1520", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="tokens" stroke="#a78bfa" fill="url(#tokenGrad)" strokeWidth={2} name="رموز" />
            </AreaChart>
          </ResponsiveContainer>
        </OwnerCard>

        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" /> الطلبات اليومية
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data!.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1520", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="requests" fill="#22d3ee" radius={[4, 4, 0, 0]} name="طلبات" />
            </BarChart>
          </ResponsiveContainer>
        </OwnerCard>
      </div>

      {/* Top Users & Model Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4">أكثر المستخدمين استهلاكاً</h2>
          <div className="space-y-2">
            {data!.topUsers.length === 0 && <p className="text-sm text-[oklch(0.5_0.04_40)]">لا توجد بيانات بعد</p>}
            {data!.topUsers.map((u: any, i: number) => (
              <div key={u.user_id} className="flex items-center justify-between p-2.5 rounded-lg bg-[oklch(0.06_0.02_30)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[oklch(0.5_0.04_40)] w-5">{i + 1}</span>
                  <span className="text-sm text-[oklch(0.85_0.04_50)]">@{u.username}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[oklch(0.6_0.04_40)]">
                  <span>{u.tokens.toLocaleString()} رمز</span>
                  <span>{u.requests} طلب</span>
                </div>
              </div>
            ))}
          </div>
        </OwnerCard>

        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4">توزيع النماذج</h2>
          <div className="space-y-2">
            {data!.modelData.length === 0 && <p className="text-sm text-[oklch(0.5_0.04_40)]">لا توجد بيانات بعد</p>}
            {data!.modelData.map((m: any) => (
              <div key={m.name} className="flex items-center justify-between p-2.5 rounded-lg bg-[oklch(0.06_0.02_30)]">
                <span className="text-sm text-[oklch(0.85_0.04_50)] font-mono truncate max-w-[200px]">{m.name}</span>
                <span className="text-xs text-[oklch(0.6_0.04_40)]">{m.count} طلب</span>
              </div>
            ))}
          </div>
        </OwnerCard>
      </div>

      {/* Recent Logs */}
      <OwnerCard>
        <div className="p-4 border-b border-[oklch(0.15_0.03_30)]">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">آخر الطلبات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[oklch(0.55_0.04_40)] text-xs uppercase tracking-wider border-b border-[oklch(0.15_0.03_30)]">
                <th className="text-right p-3">الخدمة</th>
                <th className="text-right p-3">النموذج</th>
                <th className="text-right p-3">الرموز</th>
                <th className="text-right p-3">التكلفة</th>
                <th className="text-right p-3">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[oklch(0.12_0.03_30)]">
              {data!.recentLogs.map((l: any) => (
                <tr key={l.id} className="hover:bg-[oklch(0.08_0.02_30)] transition">
                  <td className="p-3 text-[oklch(0.8_0.04_40)]">{l.service}</td>
                  <td className="p-3 text-[oklch(0.6_0.04_40)] font-mono text-xs">{l.model ?? "—"}</td>
                  <td className="p-3 text-[oklch(0.8_0.04_40)]">{l.tokens_used}</td>
                  <td className="p-3 text-[oklch(0.8_0.04_40)]">${Number(l.cost).toFixed(4)}</td>
                  <td className="p-3 text-xs text-[oklch(0.5_0.04_40)]">{formatDistanceToNow(new Date(l.created_at))} ago</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data!.recentLogs.length === 0 && <div className="p-8 text-center text-[oklch(0.5_0.04_40)]">لا توجد سجلات بعد</div>}
      </OwnerCard>
    </OwnerShell>
  );
}
