import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerStat, OwnerCard } from "@/components/owner/OwnerShell";
import { Users, FileText, ShoppingBag, MessageCircle, Globe, TrendingUp, Crown, Activity, Eye, DollarSign, Loader2, BarChart3, CheckCircle2, XCircle, ExternalLink, Monitor, Smartphone } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_owner/owner-x9k2m7/")({
  component: MissionControl,
});

const GOLD = "#d4a017";
const GOLD_LIGHT = "#f5d060";
const CYAN = "#22d3ee";
const ROSE = "#f43f5e";
const VIOLET = "#a78bfa";

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

  // Fetch today's and yesterday's online visitors from site_visits
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

      // Count referrers
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
    <OwnerCard className="p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${gaStatus === "connected" ? "bg-emerald-500/10" : "bg-yellow-500/10"}`}>
            <BarChart3 className={`h-5 w-5 ${gaStatus === "connected" ? "text-emerald-400" : "text-yellow-400"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[oklch(0.9_0.05_50)]">نظرة عامة على الزيارات</h3>
            <p className="text-xs text-[oklch(0.5_0.04_40)]">
              GA4: {gaStatus === "connected" ? "✅ متصل" : gaStatus === "checking" ? "⏳ جارِ الفحص" : "❌ غير مكتشف"} · G-QPQ40Z8H14
            </p>
          </div>
        </div>
        <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[oklch(0.6_0.15_50)] hover:text-[oklch(0.75_0.18_50)] transition">
          فتح GA4 <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-[oklch(0.08_0.02_30)] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{liveStats?.onlineNow ?? "—"}</div>
          <div className="text-[10px] text-[oklch(0.5_0.04_40)] mt-1">متصلون الآن</div>
        </div>
        <div className="bg-[oklch(0.08_0.02_30)] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-[oklch(0.75_0.18_50)]">{liveStats?.todayVisitors ?? "—"}</div>
          <div className="text-[10px] text-[oklch(0.5_0.04_40)] mt-1">زوار اليوم</div>
        </div>
        <div className="bg-[oklch(0.08_0.02_30)] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">
            {liveStats?.yesterdayVisitors ?? "—"}
            {todayGrowth !== null && (
              <span className={`text-xs mr-1 ${todayGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {todayGrowth >= 0 ? "↑" : "↓"}{Math.abs(todayGrowth)}%
              </span>
            )}
          </div>
          <div className="text-[10px] text-[oklch(0.5_0.04_40)] mt-1">زوار أمس</div>
        </div>
      </div>

      {liveStats && liveStats.topSources.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[oklch(0.7_0.05_50)] mb-2">أهم مصادر الزيارات</h4>
          <div className="space-y-1.5">
            {liveStats.topSources.map(([source, count]) => (
              <div key={source} className="flex items-center justify-between text-xs">
                <span className="text-[oklch(0.75_0.04_40)]">{source}</span>
                <span className="text-[oklch(0.55_0.04_40)]">{count} زيارة</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </OwnerCard>
  );
}
  );
}

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

      // Revenue
      const totalRevenue = (orders.data ?? []).reduce((s, o) => s + Number(o.total_amount ?? 0), 0);

      // Growth chart: signups per day (last 14 days)
      const { data: signups } = await supabase.from("profiles").select("created_at").order("created_at", { ascending: true }).limit(5000);
      const dayMap = new Map<string, number>();
      const now = Date.now();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        dayMap.set(d.toISOString().slice(0, 10), 0);
      }
      (signups ?? []).forEach((s) => {
        const day = s.created_at.slice(0, 10);
        if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      });
      const growthData = [...dayMap.entries()].map(([date, count]) => ({
        date: date.slice(5), // MM-DD
        signups: count,
      }));

      // Posts per day (last 14 days)
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
      const postsChartData = [...postDayMap.entries()].map(([date, count]) => ({
        date: date.slice(5),
        posts: count,
      }));

      // Country distribution for pie chart
      const { data: byCountry } = await supabase.from("profiles").select("country_code").not("country_code", "is", null).limit(5000);
      const countryMap = new Map<string, number>();
      (byCountry ?? []).forEach((r) => countryMap.set(r.country_code!, (countryMap.get(r.country_code!) ?? 0) + 1));
      const topCountries = [...countryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
      const otherCount = [...countryMap.values()].reduce((a, b) => a + b, 0) - topCountries.reduce((a, [, c]) => a + c, 0);
      const pieData = topCountries.map(([name, value]) => ({ name, value }));
      if (otherCount > 0) pieData.push({ name: "أخرى", value: otherCount });

      // Recent signups
      const { data: recentSignups } = await supabase.from("profiles").select("id, username, avatar_url, country_code, created_at").order("created_at", { ascending: false }).limit(8);

      // Visits per day
      const visitDayMap = new Map<string, number>();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        visitDayMap.set(d.toISOString().slice(0, 10), 0);
      }
      (visits.data ?? []).forEach((v) => {
        const day = v.first_seen.slice(0, 10);
        if (visitDayMap.has(day)) visitDayMap.set(day, (visitDayMap.get(day) ?? 0) + 1);
      });
      const visitsChartData = [...visitDayMap.entries()].map(([date, count]) => ({
        date: date.slice(5),
        visits: count,
      }));

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
      <OwnerShell title="Mission Control" subtitle="Real-time pulse of the entire hnChat universe">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[oklch(0.75_0.18_50)]" />
        </div>
      </OwnerShell>
    );
  }

  const PIE_COLORS = [GOLD, CYAN, ROSE, VIOLET, GOLD_LIGHT, "#4ade80", "#94a3b8"];

  return (
    <OwnerShell title="Mission Control" subtitle="Real-time pulse of the entire hnChat universe">
      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        <OwnerStat label="المستخدمون" value={data!.users} icon={Users} accent="amber" />
        <OwnerStat label="المنشورات" value={data!.posts} icon={FileText} accent="cyan" />
        <OwnerStat label="المنتجات" value={data!.products} icon={ShoppingBag} accent="rose" />
        <OwnerStat label="الرسائل" value={data!.messages} icon={MessageCircle} accent="cyan" />
        <OwnerStat label="المجموعات" value={data!.groups} icon={Crown} accent="amber" />
        <OwnerStat label="القصص" value={data!.stories} icon={Eye} accent="rose" />
        <OwnerStat label="الإيرادات" value={`$${data!.totalRevenue.toFixed(0)}`} icon={DollarSign} accent="amber" />
        <OwnerStat label="الزيارات" value={data!.totalVisits} icon={Activity} accent="cyan" />
      </div>

      {/* Analytics Status */}
      <AnalyticsStatusCard />

      {/* Charts Row 1: User Growth + Posts Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <OwnerCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[oklch(0.75_0.18_50)]" />
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">نمو المستخدمين (14 يوم)</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data!.growthData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1a1520", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="signups" stroke={GOLD} fill="url(#goldGrad)" strokeWidth={2} name="تسجيلات" />
            </AreaChart>
          </ResponsiveContainer>
        </OwnerCard>

        <OwnerCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-cyan-400" />
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">نشاط المنشورات (14 يوم)</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data!.postsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1a1520", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="posts" fill={CYAN} radius={[4, 4, 0, 0]} name="منشورات" />
            </BarChart>
          </ResponsiveContainer>
        </OwnerCard>
      </div>

      {/* Charts Row 2: Visits + Country Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <OwnerCard className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-[oklch(0.75_0.18_50)]" />
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">الزيارات (14 يوم)</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data!.visitsChartData}>
              <defs>
                <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={VIOLET} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={VIOLET} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1a1520", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="visits" stroke={VIOLET} fill="url(#visitGrad)" strokeWidth={2} name="زيارات" />
            </AreaChart>
          </ResponsiveContainer>
        </OwnerCard>

        <OwnerCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-[oklch(0.75_0.18_50)]" />
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">التوزيع الجغرافي</h2>
          </div>
          {data!.pieData.length === 0 ? (
            <p className="text-sm text-[oklch(0.5_0.04_40)] text-center py-10">لا توجد بيانات</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data!.pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name" label={(props: any) => `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {data!.pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1520", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </OwnerCard>
      </div>

      {/* Recent Signups */}
      <OwnerCard className="p-5">
        <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-[oklch(0.75_0.18_50)]" />
          آخر التسجيلات
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data!.recentSignups.map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-[oklch(0.06_0.02_30)] hover:bg-[oklch(0.08_0.02_30)] transition">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[oklch(0.75_0.18_50)] to-[oklch(0.55_0.22_25)] flex items-center justify-center text-xs font-bold text-[oklch(0.04_0.01_280)]">
                {(u.username ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-[oklch(0.88_0.04_50)] truncate">@{u.username}</div>
                <div className="text-[10px] text-[oklch(0.5_0.04_40)]">
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
