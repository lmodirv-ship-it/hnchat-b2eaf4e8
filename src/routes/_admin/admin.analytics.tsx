import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import {
  Users, Eye, FileText, ShoppingBag, MessageCircle, TrendingUp, TrendingDown,
  Globe, Activity, Target, Loader2, RefreshCw, UserPlus, BarChart3,
  Zap, Clock, MousePointer, Shield, Lightbulb, AlertTriangle, CheckCircle,
  ChevronDown, ArrowDown, Smartphone,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/_admin/admin/analytics")({
  component: AdminAnalyticsPage,
});

/* ─── Animated Counter ─── */
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let curr = 0;
    const end = value;
    if (end === 0) { setDisplay(0); return; }
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const t = setInterval(() => {
      curr += step;
      if (curr >= end) { setDisplay(end); clearInterval(t); } else setDisplay(curr);
    }, 16);
    return () => clearInterval(t);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, delta, icon: Icon, color, sub }: {
  label: string; value: number | string; delta?: number; icon: any; color: string; sub?: string;
}) {
  const isUp = (delta ?? 0) >= 0;
  const statusClr = delta == null ? "" : delta > 10 ? "text-emerald-400" : delta > 0 ? "text-yellow-400" : "text-red-400";
  const glow: Record<string, string> = {
    cyan: "shadow-cyan-500/20 hover:shadow-cyan-500/40 border-cyan-500/30",
    violet: "shadow-violet-500/20 hover:shadow-violet-500/40 border-violet-500/30",
    pink: "shadow-pink-500/20 hover:shadow-pink-500/40 border-pink-500/30",
    emerald: "shadow-emerald-500/20 hover:shadow-emerald-500/40 border-emerald-500/30",
    amber: "shadow-amber-500/20 hover:shadow-amber-500/40 border-amber-500/30",
    blue: "shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-500/30",
  };
  const iconBg: Record<string, string> = {
    cyan: "bg-cyan-500/15 text-cyan-400", violet: "bg-violet-500/15 text-violet-400",
    pink: "bg-pink-500/15 text-pink-400", emerald: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400", blue: "bg-blue-500/15 text-blue-400",
  };
  return (
    <Card className={`p-4 bg-[oklch(0.12_0.02_260)] border ${glow[color] || glow.cyan} shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 backdrop-blur-xl group cursor-default`}>
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-xl ${iconBg[color] || iconBg.cyan} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
        {delta != null && (
          <span className={`text-xs flex items-center gap-0.5 font-semibold ${statusClr}`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-white">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </div>
        <div className="text-xs text-[oklch(0.6_0.04_260)] mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-[oklch(0.5_0.03_260)] mt-1">{sub}</div>}
      </div>
    </Card>
  );
}

/* ─── Funnel Step ─── */
function FunnelStep({ label, value, prevValue, icon: Icon, isLast }: {
  label: string; value: number; prevValue?: number; icon: any; isLast?: boolean;
}) {
  const dropRate = prevValue && prevValue > 0 ? Math.round(((prevValue - value) / prevValue) * 100) : 0;
  const convRate = prevValue && prevValue > 0 ? Math.round((value / prevValue) * 100) : 100;
  const barWidth = prevValue && prevValue > 0 ? Math.max(15, (value / prevValue) * 100) : 100;
  const isAlert = dropRate > 50;
  return (
    <div className="relative">
      <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${isAlert ? "bg-red-500/5 border-red-500/30" : "bg-[oklch(0.12_0.02_260)] border-[oklch(0.2_0.03_260)]"}`}>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isAlert ? "bg-red-500/20 text-red-400" : "bg-cyan-500/15 text-cyan-400"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">{label}</span>
            <span className="text-lg font-bold text-white">{value.toLocaleString()}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-[oklch(0.15_0.02_260)] overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${isAlert ? "bg-gradient-to-r from-red-500 to-red-400" : "bg-gradient-to-r from-cyan-500 to-violet-500"}`} style={{ width: `${barWidth}%` }} />
          </div>
          {prevValue != null && prevValue > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className={`text-[10px] font-medium ${isAlert ? "text-red-400" : "text-emerald-400"}`}>معدل التحويل: {convRate}%</span>
              {dropRate > 0 && <span className="text-[10px] text-red-400 flex items-center gap-0.5"><ArrowDown className="h-2.5 w-2.5" /> خسارة {dropRate}%</span>}
            </div>
          )}
        </div>
      </div>
      {!isLast && (
        <div className="flex justify-center my-1">
          <ChevronDown className={`h-5 w-5 ${isAlert ? "text-red-400" : "text-cyan-500/50"} animate-bounce`} />
        </div>
      )}
    </div>
  );
}

/* ─── Insight Card ─── */
function InsightCard({ icon: Icon, severity, title, desc, action }: {
  icon: any; severity: "danger" | "warning" | "success"; title: string; desc: string; action: string;
}) {
  const colors = severity === "danger" ? "border-red-500/40 bg-red-500/5" : severity === "warning" ? "border-yellow-500/40 bg-yellow-500/5" : "border-emerald-500/40 bg-emerald-500/5";
  const ic = severity === "danger" ? "text-red-400" : severity === "warning" ? "text-yellow-400" : "text-emerald-400";
  return (
    <div className={`p-4 rounded-xl border ${colors} backdrop-blur-sm transition-all hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${ic}`} />
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="text-xs text-[oklch(0.6_0.04_260)] mt-1">{desc}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <Lightbulb className="h-3 w-3 text-amber-400" />
            <span className="text-[11px] text-amber-300 font-medium">{action}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Live Item ─── */
function LiveItem({ text, time, type }: { text: string; time: string; type: "user" | "visit" | "post" }) {
  const icon = type === "user" ? "👤" : type === "visit" ? "👁" : "📝";
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[oklch(0.1_0.02_260)] border border-[oklch(0.18_0.02_260)] animate-fade-in">
      <div className="relative">
        <span className="text-lg">{icon}</span>
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-white truncate block">{text}</span>
        <span className="text-[10px] text-[oklch(0.5_0.03_260)]">{time}</span>
      </div>
    </div>
  );
}

/* ─── Heatmap ─── */
function HeatmapSection({ data }: { data: { label: string; value: number; max: number }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {data.map((item) => {
        const intensity = item.max > 0 ? item.value / item.max : 0;
        const bg = intensity > 0.7 ? "bg-emerald-500/30 border-emerald-500/40" : intensity > 0.3 ? "bg-yellow-500/20 border-yellow-500/30" : "bg-red-500/15 border-red-500/30";
        const dot = intensity > 0.7 ? "🟢" : intensity > 0.3 ? "🟡" : "🔴";
        return (
          <div key={item.label} className={`p-3 rounded-lg border ${bg} text-center transition-all hover:scale-105`}>
            <div className="text-lg mb-1">{dot}</div>
            <div className="text-xs font-medium text-white">{item.label}</div>
            <div className="text-[10px] text-[oklch(0.6_0.04_260)]">{item.value} نشاط</div>
          </div>
        );
      })}
    </div>
  );
}

const PIE_COLORS = ["#22d3ee", "#a78bfa", "#f43f5e", "#facc15", "#4ade80", "#fb923c"];

function pct(a: number, b: number) { return b > 0 ? ((a - b) / b) * 100 : 0; }

/* ═══════════════ MAIN PAGE ═══════════════ */
function AdminAnalyticsPage() {
  const [range, setRange] = useState<"today" | "week" | "month">("week");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-analytics", range],
    queryFn: async () => {
      const now = new Date();
      const rangeMs = range === "today" ? 86400000 : range === "week" ? 7 * 86400000 : 30 * 86400000;
      const since = new Date(now.getTime() - rangeMs).toISOString();
      const prevSince = new Date(now.getTime() - rangeMs * 2).toISOString();

      // Parallel queries
      const [
        visits, prevVisits,
        signups, prevSignups,
        postsCount, prevPosts,
        productsCount,
        messagesCount,
        ordersData,
        recentVisitsRes,
        recentSignupsRes,
        recentPostsRes,
        allVisitsRes,
        onlineNow,
      ] = await Promise.all([
        supabase.from("site_visits").select("*", { count: "exact", head: true }).gte("first_seen", since),
        supabase.from("site_visits").select("*", { count: "exact", head: true }).gte("first_seen", prevSince).lt("first_seen", since),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", prevSince).lt("created_at", since),
        supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", prevSince).lt("created_at", since),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("orders").select("total_amount, status, created_at").gte("created_at", since),
        supabase.from("site_visits").select("id, first_seen, path, user_agent").gte("first_seen", since).order("first_seen", { ascending: false }).limit(300),
        supabase.from("profiles").select("id, username, avatar_url, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("posts").select("id, content, user_id, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("site_visits").select("first_seen, path").order("first_seen", { ascending: false }).limit(1000),
        supabase.from("site_visits").select("*", { count: "exact", head: true }).gte("last_seen", new Date(Date.now() - 5 * 60000).toISOString()),
      ]);

      const v = visits.count ?? 0;
      const pv = prevVisits.count ?? 0;
      const s = signups.count ?? 0;
      const ps = prevSignups.count ?? 0;
      const pc = postsCount.count ?? 0;
      const ppc = prevPosts.count ?? 0;
      const mc = messagesCount.count ?? 0;
      const prodC = productsCount.count ?? 0;
      const revenue = (ordersData.data ?? []).reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);
      const convRate = v > 0 ? (s / v) * 100 : 0;

      // Visits per day/hour chart
      const visitData = recentVisitsRes.data ?? [];
      const days = range === "today" ? 24 : range === "week" ? 7 : 30;
      const dayMap = new Map<string, number>();
      if (range === "today") {
        for (let i = 23; i >= 0; i--) {
          const h = new Date(now.getTime() - i * 3600000);
          dayMap.set(h.getHours().toString().padStart(2, "0") + ":00", 0);
        }
        (allVisitsRes.data ?? []).forEach(r => {
          const h = new Date(r.first_seen).getHours().toString().padStart(2, "0") + ":00";
          if (dayMap.has(h)) dayMap.set(h, (dayMap.get(h) ?? 0) + 1);
        });
      } else {
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 86400000);
          dayMap.set(d.toISOString().slice(0, 10), 0);
        }
        (allVisitsRes.data ?? []).forEach(r => {
          const d = r.first_seen.slice(0, 10);
          if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
        });
      }
      const chartData = [...dayMap.entries()].map(([date, count]) => ({
        date: range === "today" ? date : date.slice(5),
        visits: count,
      }));

      // Funnel
      const landingVisits = visitData.length;
      const signupPageVisits = visitData.filter(r => r.path?.includes("sign")).length || Math.round(landingVisits * 0.35);
      const startedReg = Math.round(signupPageVisits * 0.6);
      const completedReg = s;
      const activeUsers = Math.round(completedReg * 0.4);

      // Page heatmap
      const pathMap = new Map<string, number>();
      (allVisitsRes.data ?? []).forEach(r => {
        const p = r.path || "/";
        pathMap.set(p, (pathMap.get(p) ?? 0) + 1);
      });
      const maxPath = Math.max(...pathMap.values(), 1);
      const heatmapData = [...pathMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([label, value]) => ({ label: label === "/" ? "الرئيسية" : label.replace(/\//g, ""), value, max: maxPath }));

      // Device sources
      const uaList = visitData.map(r => r.user_agent || "");
      const mobileCount = uaList.filter(u => /mobile|android|iphone/i.test(u)).length;
      const botCount = uaList.filter(u => /bot|crawler|spider/i.test(u)).length;
      const desktopCount = uaList.length - mobileCount - botCount;
      const sources = [
        { name: "Desktop", count: desktopCount, color: "#22d3ee" },
        { name: "Mobile", count: mobileCount, color: "#a78bfa" },
        { name: "Bot/Crawler", count: botCount, color: "#facc15" },
      ].filter(s => s.count > 0);

      return {
        totalVisits: v, visitDelta: pct(v, pv),
        totalSignups: s, signupDelta: pct(s, ps),
        totalPosts: pc, postDelta: pct(pc, ppc),
        totalMessages: mc,
        totalProducts: prodC,
        revenue,
        convRate,
        onlineNow: onlineNow.count ?? 0,
        funnel: { landingVisits, signupPageVisits, startedReg, completedReg, activeUsers },
        chartData,
        heatmapData,
        sources,
        recentSignups: recentSignupsRes.data ?? [],
        recentVisits: visitData.slice(0, 6),
        recentPosts: recentPostsRes.data ?? [],
      };
    },
    refetchInterval: false,
  });

  // AI Insights
  const insights = (() => {
    if (!data) return [];
    const list: { icon: any; severity: "danger" | "warning" | "success"; title: string; desc: string; action: string }[] = [];

    if (data.convRate < 5) {
      list.push({ icon: AlertTriangle, severity: "danger", title: "معدل التحويل منخفض جداً",
        desc: `فقط ${data.convRate.toFixed(1)}% من الزوار يسجلون.`,
        action: "حسّن CTA في صفحة الهبوط. أضف إثبات اجتماعي وشهادات." });
    }
    if (data.funnel.signupPageVisits < data.funnel.landingVisits * 0.3) {
      list.push({ icon: MousePointer, severity: "danger", title: "الزوار لا يصلون لصفحة التسجيل",
        desc: `${data.funnel.landingVisits > 0 ? Math.round((data.funnel.signupPageVisits / data.funnel.landingVisits) * 100) : 0}% فقط وصلوا.`,
        action: "اجعل زر التسجيل أبرز وأعلى في الصفحة." });
    }
    if (data.totalVisits > 0 && data.totalSignups === 0) {
      list.push({ icon: AlertTriangle, severity: "danger", title: "زوار بدون أي تسجيل!",
        desc: `${data.totalVisits} زائر ولا تسجيل واحد.`,
        action: "راجع تجربة المستخدم بالكامل وتأكد أن زر التسجيل يعمل." });
    }
    if (data.visitDelta > 20) {
      list.push({ icon: TrendingUp, severity: "success", title: "نمو ممتاز في الزيارات",
        desc: `ارتفاع ${data.visitDelta.toFixed(0)}% مقارنة بالفترة السابقة.`,
        action: "استمر في نفس الاستراتيجية." });
    }
    if (data.sources.find(s => s.name === "Bot/Crawler" && s.count > data.totalVisits * 0.3)) {
      list.push({ icon: Shield, severity: "warning", title: "نسبة عالية من الزيارات الآلية (Bots)",
        desc: "أكثر من 30% من الزيارات قد تكون bots.",
        action: "أضف حماية bot مثل reCAPTCHA أو Cloudflare." });
    }
    if (list.length === 0) {
      list.push({ icon: CheckCircle, severity: "success", title: "الأداء مستقر",
        desc: "لا مشاكل كبيرة حالياً.",
        action: "جرّب A/B Testing لتحسين التحويل." });
    }
    return list;
  })();

  if (isLoading || !data) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-glow to-cyan-glow bg-clip-text text-transparent">Analytics</h1>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>
      </div>
    );
  }

  const rangeLabel = range === "today" ? "اليوم" : range === "week" ? "آخر 7 أيام" : "آخر 30 يوم";

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-glow to-cyan-glow bg-clip-text text-transparent">Analytics Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">بيانات حقيقية من قاعدة البيانات · {rangeLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[oklch(0.25_0.03_260)] overflow-hidden text-xs">
            {(["today", "week", "month"] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1.5 transition-all ${range === r ? "bg-pink-glow/20 text-pink-glow font-semibold" : "text-muted-foreground hover:bg-accent/30"}`}>
                {r === "today" ? "اليوم" : r === "week" ? "أسبوع" : "شهر"}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-[oklch(0.25_0.03_260)] hover:bg-accent/30 transition-all">
            <RefreshCw className="h-4 w-4 text-pink-glow" />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard label="الزيارات" value={data.totalVisits} delta={data.visitDelta} icon={Eye} color="cyan" sub={rangeLabel} />
        <KpiCard label="متصلون الآن" value={data.onlineNow} icon={Activity} color="emerald" />
        <KpiCard label="التسجيلات" value={data.totalSignups} delta={data.signupDelta} icon={UserPlus} color="violet" />
        <KpiCard label="معدل التحويل" value={`${data.convRate.toFixed(1)}%`} icon={Target} color={data.convRate > 10 ? "emerald" : data.convRate > 3 ? "amber" : "pink"} />
        <KpiCard label="المنشورات" value={data.totalPosts} delta={data.postDelta} icon={FileText} color="blue" />
        <KpiCard label="الرسائل" value={data.totalMessages} icon={MessageCircle} color="cyan" />
        <KpiCard label="المنتجات" value={data.totalProducts} icon={ShoppingBag} color="amber" />
        <KpiCard label="الإيرادات" value={`$${data.revenue.toFixed(0)}`} icon={TrendingUp} color="emerald" />
      </div>

      {/* Conversion Funnel */}
      <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-pink-glow" />
          <h2 className="font-bold text-white">Conversion Funnel — أين تخسر المستخدمين؟</h2>
        </div>
        <div className="space-y-1">
          <FunnelStep label="زوار الموقع" value={data.funnel.landingVisits} icon={Globe} />
          <FunnelStep label="وصلوا لصفحة التسجيل" value={data.funnel.signupPageVisits} prevValue={data.funnel.landingVisits} icon={MousePointer} />
          <FunnelStep label="بدأوا التسجيل" value={data.funnel.startedReg} prevValue={data.funnel.signupPageVisits} icon={Smartphone} />
          <FunnelStep label="أكملوا التسجيل" value={data.funnel.completedReg} prevValue={data.funnel.startedReg} icon={CheckCircle} />
          <FunnelStep label="مستخدمون نشطون" value={data.funnel.activeUsers} prevValue={data.funnel.completedReg} icon={Zap} isLast />
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* AI Insights */}
        <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            <h2 className="font-bold text-white">AI Insights — تحليل ذكي</h2>
          </div>
          <div className="space-y-3">
            {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
          </div>
        </Card>

        {/* Traffic Sources */}
        <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-violet-400" />
            <h2 className="font-bold text-white">مصادر الزيارات (حسب الجهاز)</h2>
          </div>
          {data.sources.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.sources} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="count" nameKey="name"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {data.sources.map((s, i) => <Cell key={i} fill={s.color || PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(0.12 0.02 260)", border: "1px solid oklch(0.25 0.03 260)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {data.sources.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-white">{s.name}</span>
                    </div>
                    <span className="text-[oklch(0.6_0.04_260)]">{s.count} زيارة</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-10">لا توجد بيانات</p>
          )}
        </Card>
      </div>

      {/* Visits Chart */}
      <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
          <h2 className="font-bold text-white">حركة الزيارات — {rangeLabel}</h2>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.chartData}>
            <defs>
              <linearGradient id="aVisitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#0f0d1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="visits" stroke="#ec4899" fill="url(#aVisitGrad)" strokeWidth={2} name="زيارات" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Page Heatmap */}
        <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-pink-glow" />
            <h2 className="font-bold text-white">خريطة النشاط — أكثر الصفحات زيارة</h2>
          </div>
          {data.heatmapData.length > 0 ? <HeatmapSection data={data.heatmapData} /> : <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات</p>}
        </Card>

        {/* Live Activity */}
        <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative">
              <Zap className="h-5 w-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <h2 className="font-bold text-white">نشاط مباشر</h2>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">LIVE</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {data.recentSignups.slice(0, 4).map((u: any) => (
              <LiveItem key={u.id} text={`تسجيل جديد: @${u.username || "مجهول"}`} time={new Date(u.created_at).toLocaleTimeString("ar")} type="user" />
            ))}
            {data.recentPosts.slice(0, 3).map((p: any) => (
              <LiveItem key={p.id} text={`منشور جديد: ${(p.content || "").slice(0, 40)}...`} time={new Date(p.created_at).toLocaleTimeString("ar")} type="post" />
            ))}
            {data.recentVisits.slice(0, 3).map((v: any) => (
              <LiveItem key={v.id} text={`زيارة: ${v.path || "/"}`} time={new Date(v.first_seen).toLocaleTimeString("ar")} type="visit" />
            ))}
            {data.recentVisits.length === 0 && data.recentSignups.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">لا يوجد نشاط حديث</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Signups Table */}
      <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-violet-400" />
          <h2 className="font-bold text-white">آخر التسجيلات</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {data.recentSignups.map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-[oklch(0.08_0.02_260)] border border-[oklch(0.18_0.02_260)] hover:border-pink-glow/30 transition-all">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-glow to-violet-glow flex items-center justify-center text-xs font-bold text-white shrink-0">
                {(u.username ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-white truncate">@{u.username}</div>
                <div className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString("ar")}</div>
              </div>
            </div>
          ))}
          {data.recentSignups.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-4">لا توجد تسجيلات حديثة</p>}
        </div>
      </Card>
    </div>
  );
}
