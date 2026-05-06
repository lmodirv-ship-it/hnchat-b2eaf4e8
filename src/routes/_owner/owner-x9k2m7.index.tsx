import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerStat, OwnerCard } from "@/components/owner/OwnerShell";
import { Users, FileText, ShoppingBag, MessageCircle, Globe, TrendingUp, Crown, Activity, Eye, DollarSign, Loader2, BarChart3, ExternalLink, Zap, Brain, Shield, Cpu } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_owner/owner-x9k2m7/")({
  component: MissionControl,
});

const COLORS = {
  cyan: "oklch(0.78 0.18 220)",
  violet: "oklch(0.65 0.25 295)",
  emerald: "oklch(0.7 0.2 160)",
  amber: "oklch(0.8 0.16 80)",
  rose: "oklch(0.7 0.22 15)",
};

const PIE_COLORS = ["#22d3ee", "#a78bfa", "#f43f5e", "#f5d060", "#4ade80", "#fb923c", "#94a3b8"];

/* ═══ System Pulse — Living status indicator ═══ */
function SystemPulse() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 50);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[oklch(0.78_0.18_220/0.2)] to-[oklch(0.65_0.25_295/0.15)] flex items-center justify-center animate-breathe">
          <Brain className="h-5 w-5 text-[oklch(0.82_0.14_220)]" />
        </div>
        <svg className="absolute inset-0" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="none" stroke="oklch(1 0 0 / 0.06)" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="22" fill="none" stroke="url(#pulseGrad)" strokeWidth="1.5"
            strokeDasharray={`${pulse * 1.38} ${138.2 - pulse * 1.38}`}
            strokeLinecap="round" transform="rotate(-90 24 24)" />
          <defs>
            <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.78 0.18 220)" />
              <stop offset="100%" stopColor="oklch(0.65 0.25 295)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <div className="text-sm font-semibold text-[oklch(0.9_0.03_250)]">Neural Core Active</div>
        <div className="text-[10px] text-[oklch(0.5_0.05_220)] tracking-wide">جميع الأنظمة تعمل · AI Engine Online</div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {["Database", "AI", "CDN", "Auth"].map((s) => (
          <div key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[oklch(0.06_0.015_260/0.8)] border border-[oklch(1_0_0/0.06)]">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-status-glow" style={{ color: "oklch(0.7 0.2 160)" }} />
            <span className="text-[9px] text-[oklch(0.6_0.03_250)] font-medium">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ Analytics Overview ═══ */
function AnalyticsOverviewCard() {
  const [gaStatus, setGaStatus] = useState<"checking" | "connected" | "not-detected">("checking");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && typeof window.gtag === "function" && Array.isArray(window.dataLayer) && window.dataLayer.length > 0) {
        setGaStatus("connected");
      } else {
        setGaStatus("not-detected");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const { data: liveStats } = useQuery({
    queryKey: ["owner-live-analytics"],
    queryFn: async () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

      const [onlineNow, todayVisitors, yesterdayVisitors, topReferrers] = await Promise.all([
        supabase.from("site_visits").select("*", { count: "exact", head: true }).gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString()),
        supabase.from("site_visits").select("*", { count: "exact", head: true }).gte("first_seen", todayStart),
        supabase.from("site_visits").select("*", { count: "exact", head: true }).gte("first_seen", yesterdayStart).lt("first_seen", todayStart),
        supabase.from("site_visits").select("referrer").not("referrer", "is", null).order("first_seen", { ascending: false }).limit(200),
      ]);

      const refMap = new Map<string, number>();
      (topReferrers.data ?? []).forEach((r: any) => {
        if (r.referrer) {
          try {
            const host = new URL(r.referrer).hostname.replace("www.", "");
            refMap.set(host, (refMap.get(host) ?? 0) + 1);
          } catch {
            refMap.set(r.referrer, (refMap.get(r.referrer) ?? 0) + 1);
          }
        }
      });
      const topSources = [...refMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

      return {
        onlineNow: onlineNow.count ?? 0,
        todayVisitors: todayVisitors.count ?? 0,
        yesterdayVisitors: yesterdayVisitors.count ?? 0,
        topSources,
      };
    },
    refetchInterval: 30_000,
  });

  const todayGrowth = liveStats && liveStats.yesterdayVisitors > 0
    ? Math.round(((liveStats.todayVisitors - liveStats.yesterdayVisitors) / liveStats.yesterdayVisitors) * 100)
    : null;

  return (
    <OwnerCard glow="cyan" className="p-6 mb-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.18_220/0.2)] to-[oklch(0.65_0.25_295/0.1)]">
            <Activity className="h-5 w-5 text-[oklch(0.82_0.14_220)]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[oklch(0.9_0.03_250)]">Live Signals</h3>
            <p className="text-[10px] text-[oklch(0.45_0.03_250)]">
              GA4: {gaStatus === "connected" ? "✅ متصل" : gaStatus === "checking" ? "⏳" : "—"} · Real-time tracking
            </p>
          </div>
        </div>
        <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-[oklch(0.55_0.1_220)] hover:text-[oklch(0.75_0.15_220)] transition">
          Open GA4 <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "متصلون الآن", value: liveStats?.onlineNow ?? "—", color: "oklch(0.7 0.2 160)" },
          { label: "زوار اليوم", value: liveStats?.todayVisitors ?? "—", color: "oklch(0.78 0.18 220)" },
          {
            label: "زوار أمس",
            value: liveStats?.yesterdayVisitors ?? "—",
            color: "oklch(0.65 0.25 295)",
            extra: todayGrowth !== null ? (
              <span className={`text-[10px] ml-1 ${todayGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {todayGrowth >= 0 ? "↑" : "↓"}{Math.abs(todayGrowth)}%
              </span>
            ) : null,
          },
        ].map((item) => (
          <div key={item.label} className="relative rounded-xl bg-[oklch(0.04_0.01_260/0.6)] border border-[oklch(1_0_0/0.04)] p-4 text-center overflow-hidden group hover:border-[oklch(1_0_0/0.1)] transition-all duration-500">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `radial-gradient(circle at center, ${item.color}10, transparent 70%)` }} />
            <div className="text-3xl font-bold tabular-nums relative" style={{ color: item.color }}>
              {item.value}
              {(item as any).extra}
            </div>
            <div className="text-[9px] text-[oklch(0.45_0.03_250)] mt-1.5 uppercase tracking-wider relative">{item.label}</div>
          </div>
        ))}
      </div>

      {liveStats && liveStats.topSources.length > 0 && (
        <div>
          <h4 className="text-[10px] font-semibold text-[oklch(0.55_0.05_220)] mb-2.5 uppercase tracking-wider">Traffic Sources</h4>
          <div className="space-y-2">
            {liveStats.topSources.map(([source, count]) => {
              const maxCount = liveStats.topSources[0][1];
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={source} className="flex items-center gap-3 text-xs">
                  <span className="text-[oklch(0.7_0.03_250)] w-28 truncate">{source}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[oklch(1_0_0/0.04)] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.18_220)] to-[oklch(0.65_0.25_295)] transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[oklch(0.5_0.03_250)] tabular-nums w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </OwnerCard>
  );
}

/* ═══ Chart Card wrapper ═══ */
function ChartCard({ title, icon: Icon, children, span }: { title: string; icon: any; children: ReactNode; span?: string }) {
  return (
    <OwnerCard className={`p-5 ${span ?? ""}`} glow="cyan">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-1.5 rounded-lg bg-[oklch(0.78_0.18_220/0.1)]">
          <Icon className="h-4 w-4 text-[oklch(0.75_0.14_220)]" />
        </div>
        <h2 className="text-sm font-semibold text-[oklch(0.85_0.03_250)]">{title}</h2>
      </div>
      {children}
    </OwnerCard>
  );
}

import type { ReactNode } from "react";

/* ═══ Mission Control ═══ */
function MissionControl() {
  const { data, isLoading } = useQuery({
    queryKey: ["owner-overview-v2"],
    queryFn: async () => {
      const [users, posts, products, messages, groups, orders, stories, visits] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("groups").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount, status, created_at").limit(500),
        supabase.from("stories").select("*", { count: "exact", head: true }),
        supabase.from("site_visits").select("first_seen").order("first_seen", { ascending: false }).limit(1000),
      ]);

      const totalRevenue = (orders.data ?? []).reduce((s, o) => s + Number(o.total_amount ?? 0), 0);

      const { data: signups } = await supabase.from("profiles").select("created_at").order("created_at", { ascending: true }).limit(5000);
      const now = Date.now();
      const dayMap = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        dayMap.set(d.toISOString().slice(0, 10), 0);
      }
      (signups ?? []).forEach((s) => {
        const day = s.created_at.slice(0, 10);
        if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      });
      const growthData = [...dayMap.entries()].map(([date, count]) => ({ date: date.slice(5), signups: count }));

      const { data: postsByDay } = await supabase.from("posts").select("created_at").order("created_at", { ascending: true }).limit(5000);
      const postDayMap = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        postDayMap.set(d.toISOString().slice(0, 10), 0);
      }
      (postsByDay ?? []).forEach((p) => {
        const day = p.created_at.slice(0, 10);
        if (postDayMap.has(day)) postDayMap.set(day, (postDayMap.get(day) ?? 0) + 1);
      });
      const postsChartData = [...postDayMap.entries()].map(([date, count]) => ({ date: date.slice(5), posts: count }));

      const { data: byCountry } = await supabase.from("profiles").select("country_code").not("country_code", "is", null).limit(5000);
      const countryMap = new Map<string, number>();
      (byCountry ?? []).forEach((r) => countryMap.set(r.country_code!, (countryMap.get(r.country_code!) ?? 0) + 1));
      const topCountries = [...countryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
      const otherCount = [...countryMap.values()].reduce((a, b) => a + b, 0) - topCountries.reduce((a, [, c]) => a + c, 0);
      const pieData = topCountries.map(([name, value]) => ({ name, value }));
      if (otherCount > 0) pieData.push({ name: "أخرى", value: otherCount });

      const { data: recentSignups } = await supabase.from("profiles").select("id, username, avatar_url, country_code, created_at").order("created_at", { ascending: false }).limit(8);

      const visitDayMap = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        visitDayMap.set(d.toISOString().slice(0, 10), 0);
      }
      (visits.data ?? []).forEach((v) => {
        const day = v.first_seen.slice(0, 10);
        if (visitDayMap.has(day)) visitDayMap.set(day, (visitDayMap.get(day) ?? 0) + 1);
      });
      const visitsChartData = [...visitDayMap.entries()].map(([date, count]) => ({ date: date.slice(5), visits: count }));

      return {
        users: users.count ?? 0,
        posts: posts.count ?? 0,
        products: products.count ?? 0,
        messages: messages.count ?? 0,
        groups: groups.count ?? 0,
        stories: stories.count ?? 0,
        totalRevenue,
        totalVisits: visits.data?.length ?? 0,
        growthData,
        postsChartData,
        visitsChartData,
        pieData,
        recentSignups: recentSignups ?? [],
      };
    },
  });

  if (isLoading) {
    return (
      <OwnerShell title="Mission Control" subtitle="Neural command center — monitoring all hnChat systems">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-[oklch(0.78_0.18_220)]" />
            <div className="absolute inset-0 h-12 w-12 rounded-full bg-[oklch(0.78_0.18_220/0.15)] blur-xl animate-neural" />
          </div>
          <span className="text-xs text-[oklch(0.5_0.05_220)] tracking-wider">Initializing neural core...</span>
        </div>
      </OwnerShell>
    );
  }

  const d = data!;

  const chartTooltipStyle = {
    background: "oklch(0.06 0.02 260 / 0.95)",
    border: "1px solid oklch(1 0 0 / 0.1)",
    borderRadius: 12,
    fontSize: 11,
    backdropFilter: "blur(12px)",
    color: "oklch(0.85 0.03 250)",
  };

  return (
    <OwnerShell title="Mission Control" subtitle="Neural command center — monitoring all hnChat systems">
      <SystemPulse />

      {/* ─── KPI Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 mb-8">
        <OwnerStat label="المستخدمون" value={d.users} icon={Users} accent="cyan" />
        <OwnerStat label="المنشورات" value={d.posts} icon={FileText} accent="cyan" />
        <OwnerStat label="الرسائل" value={d.messages} icon={MessageCircle} accent="cyan" />
        <OwnerStat label="الزيارات" value={d.totalVisits} icon={Activity} accent="cyan" />
        <OwnerStat label="المنتجات" value={d.products} icon={ShoppingBag} accent="amber" />
        <OwnerStat label="المجموعات" value={d.groups} icon={Crown} accent="amber" />
        <OwnerStat label="القصص" value={d.stories} icon={Eye} accent="rose" />
        <OwnerStat label="الإيرادات" value={`$${d.totalRevenue.toFixed(0)}`} icon={DollarSign} accent="amber" />
      </div>

      {/* ─── Live Analytics ─── */}
      <AnalyticsOverviewCard />

      {/* ─── Charts Row 1 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="نمو المستخدمين (14 يوم)" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={d.growthData}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.04)" />
              <XAxis dataKey="date" tick={{ fill: "oklch(0.45 0.02 250)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.45 0.02 250)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="signups" stroke="#22d3ee" fill="url(#cyanGrad)" strokeWidth={2} name="تسجيلات" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="نشاط المنشورات (14 يوم)" icon={FileText}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.postsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.04)" />
              <XAxis dataKey="date" tick={{ fill: "oklch(0.45 0.02 250)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.45 0.02 250)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="posts" fill="#a78bfa" radius={[6, 6, 0, 0]} name="منشورات" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ─── Charts Row 2 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <ChartCard title="الزيارات (14 يوم)" icon={Activity} span="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={d.visitsChartData}>
              <defs>
                <linearGradient id="visitGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.04)" />
              <XAxis dataKey="date" tick={{ fill: "oklch(0.45 0.02 250)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.45 0.02 250)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="visits" stroke="#a78bfa" fill="url(#visitGrad2)" strokeWidth={2} name="زيارات" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="التوزيع الجغرافي" icon={Globe}>
          {d.pieData.length === 0 ? (
            <p className="text-sm text-[oklch(0.45_0.03_250)] text-center py-10">لا توجد بيانات</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={d.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name"
                  label={(props: any) => `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}
                  stroke="oklch(0.05 0.01 270)" strokeWidth={2}
                >
                  {d.pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ─── Recent Signups ─── */}
      <OwnerCard className="p-6" glow="violet">
        <h2 className="text-sm font-semibold text-[oklch(0.85_0.03_250)] mb-5 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[oklch(0.65_0.25_295/0.1)]">
            <Users className="h-4 w-4 text-[oklch(0.7_0.2_295)]" />
          </div>
          آخر التسجيلات
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {d.recentSignups.map((u: any) => (
            <div key={u.id} className="group flex items-center gap-3 p-3.5 rounded-xl bg-[oklch(0.04_0.01_260/0.5)] border border-[oklch(1_0_0/0.04)] hover:border-[oklch(0.65_0.25_295/0.3)] transition-all duration-500">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[oklch(0.78_0.18_220)] to-[oklch(0.65_0.25_295)] flex items-center justify-center text-xs font-bold text-[oklch(0.04_0.01_280)] group-hover:shadow-[0_0_20px_oklch(0.65_0.25_295/0.3)] transition-shadow duration-500">
                {(u.username ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[oklch(0.85_0.03_250)] truncate">@{u.username}</div>
                <div className="text-[10px] text-[oklch(0.45_0.03_250)]">
                  {u.country_code ?? "—"} · {new Date(u.created_at).toLocaleDateString("ar")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </OwnerCard>
    </OwnerShell>
  );
}
