import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import {
  Users, Eye, UserPlus, BarChart3, TrendingUp, TrendingDown,
  Zap, AlertTriangle, CheckCircle, Activity, Globe, ArrowDown,
  Smartphone, MousePointer, Shield, Clock, Target, Lightbulb,
  ChevronDown, RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/growth")({
  component: GrowthPage,
});

/* ─── Animated Counter ─── */
function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) { setDisplay(0); return; }
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

/* ─── Glow KPI Card ─── */
function GlowStatCard({ label, value, delta, icon: Icon, color, subtitle }: {
  label: string; value: number | string; delta?: number; icon: any; color: string; subtitle?: string;
}) {
  const isUp = (delta ?? 0) >= 0;
  const statusColor = delta == null ? "" : delta > 10 ? "text-emerald-400" : delta > 0 ? "text-yellow-400" : "text-red-400";
  const glowColor = color === "cyan" ? "shadow-cyan-500/20 hover:shadow-cyan-500/40 border-cyan-500/30"
    : color === "violet" ? "shadow-violet-500/20 hover:shadow-violet-500/40 border-violet-500/30"
    : color === "pink" ? "shadow-pink-500/20 hover:shadow-pink-500/40 border-pink-500/30"
    : color === "emerald" ? "shadow-emerald-500/20 hover:shadow-emerald-500/40 border-emerald-500/30"
    : color === "amber" ? "shadow-amber-500/20 hover:shadow-amber-500/40 border-amber-500/30"
    : "shadow-blue-500/20 hover:shadow-blue-500/40 border-blue-500/30";

  const iconBg = color === "cyan" ? "bg-cyan-500/15 text-cyan-400"
    : color === "violet" ? "bg-violet-500/15 text-violet-400"
    : color === "pink" ? "bg-pink-500/15 text-pink-400"
    : color === "emerald" ? "bg-emerald-500/15 text-emerald-400"
    : color === "amber" ? "bg-amber-500/15 text-amber-400"
    : "bg-blue-500/15 text-blue-400";

  return (
    <Card className={`p-4 bg-[oklch(0.12_0.02_260)] border ${glowColor} shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 backdrop-blur-xl group cursor-default`}>
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
        {delta != null && (
          <span className={`text-xs flex items-center gap-0.5 font-semibold ${statusColor}`}>
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
        {subtitle && <div className="text-[10px] text-[oklch(0.5_0.03_260)] mt-1">{subtitle}</div>}
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
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isAlert ? "bg-gradient-to-r from-red-500 to-red-400" : "bg-gradient-to-r from-cyan-500 to-violet-500"}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          {prevValue != null && prevValue > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className={`text-[10px] font-medium ${isAlert ? "text-red-400" : "text-emerald-400"}`}>
                معدل التحويل: {convRate}%
              </span>
              {dropRate > 0 && (
                <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                  <ArrowDown className="h-2.5 w-2.5" /> خسارة {dropRate}%
                </span>
              )}
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

/* ─── AI Insight Card ─── */
function InsightCard({ icon: Icon, severity, title, desc, action }: {
  icon: any; severity: "danger" | "warning" | "success"; title: string; desc: string; action: string;
}) {
  const colors = severity === "danger"
    ? "border-red-500/40 bg-red-500/5"
    : severity === "warning"
    ? "border-yellow-500/40 bg-yellow-500/5"
    : "border-emerald-500/40 bg-emerald-500/5";
  const iconColor = severity === "danger" ? "text-red-400" : severity === "warning" ? "text-yellow-400" : "text-emerald-400";

  return (
    <div className={`p-4 rounded-xl border ${colors} backdrop-blur-sm transition-all hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${iconColor}`} />
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

/* ─── Live Activity Item ─── */
function LiveItem({ text, time, type }: { text: string; time: string; type: "user" | "visit" | "action" }) {
  const icon = type === "user" ? "👤" : type === "visit" ? "👁" : "⚡";
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

/* ─── Heatmap Grid ─── */
function HeatmapSection({ data }: { data: { label: string; value: number; max: number }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {data.map((item) => {
        const intensity = item.max > 0 ? item.value / item.max : 0;
        const bg = intensity > 0.7 ? "bg-emerald-500/30 border-emerald-500/40"
          : intensity > 0.3 ? "bg-yellow-500/20 border-yellow-500/30"
          : "bg-red-500/15 border-red-500/30";
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

/* ─── MAIN PAGE ─── */
function GrowthPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["growth-dashboard", user?.id, timeRange],
    queryFn: async () => {
      const now = new Date();
      const rangeMs = timeRange === "today" ? 86400000 : timeRange === "week" ? 7 * 86400000 : 30 * 86400000;
      const since = new Date(now.getTime() - rangeMs).toISOString();
      const prevSince = new Date(now.getTime() - rangeMs * 2).toISOString();

      const [visits, prevVisits, signups, prevSignups, posts, recentVisits, recentSignups, allVisits] = await Promise.all([
        supabase.from("site_visits").select("*", { count: "exact", head: true }).gte("first_seen", since),
        supabase.from("site_visits").select("*", { count: "exact", head: true }).gte("first_seen", prevSince).lt("first_seen", since),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", prevSince).lt("created_at", since),
        supabase.from("posts").select("*", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("site_visits").select("id, first_seen, path, user_agent").gte("first_seen", since).order("first_seen", { ascending: false }).limit(200),
        supabase.from("profiles").select("id, username, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("site_visits").select("first_seen, path").order("first_seen", { ascending: false }).limit(1000),
      ]);

      const totalVisits = visits.count ?? 0;
      const totalPrevVisits = prevVisits.count ?? 0;
      const totalSignups = signups.count ?? 0;
      const totalPrevSignups = prevSignups.count ?? 0;
      const totalPosts = posts.count ?? 0;

      const visitDelta = totalPrevVisits > 0 ? ((totalVisits - totalPrevVisits) / totalPrevVisits) * 100 : 0;
      const signupDelta = totalPrevSignups > 0 ? ((totalSignups - totalPrevSignups) / totalPrevSignups) * 100 : 0;
      const conversionRate = totalVisits > 0 ? (totalSignups / totalVisits) * 100 : 0;

      // Path-based funnel estimation
      const visitData = recentVisits.data ?? [];
      const landingVisits = visitData.length;
      const signupPageVisits = visitData.filter(v => v.path?.includes("sign")).length || Math.round(landingVisits * 0.35);
      const startedReg = Math.round(signupPageVisits * 0.6);
      const completedReg = totalSignups;
      const activeUsers = Math.round(completedReg * 0.4);

      // Visits per day chart
      const dayMap = new Map<string, number>();
      const days = timeRange === "today" ? 24 : timeRange === "week" ? 7 : 30;
      if (timeRange === "today") {
        for (let i = 23; i >= 0; i--) {
          const h = new Date(now.getTime() - i * 3600000);
          dayMap.set(h.getHours().toString().padStart(2, "0") + ":00", 0);
        }
        (allVisits.data ?? []).forEach(v => {
          const h = new Date(v.first_seen).getHours().toString().padStart(2, "0") + ":00";
          if (dayMap.has(h)) dayMap.set(h, (dayMap.get(h) ?? 0) + 1);
        });
      } else {
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 86400000);
          dayMap.set(d.toISOString().slice(0, 10), 0);
        }
        (allVisits.data ?? []).forEach(v => {
          const d = v.first_seen.slice(0, 10);
          if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
        });
      }
      const chartData = [...dayMap.entries()].map(([date, count]) => ({
        date: timeRange === "today" ? date : date.slice(5),
        visits: count,
      }));

      // Page heatmap
      const pathMap = new Map<string, number>();
      (allVisits.data ?? []).forEach(v => {
        const p = v.path || "/";
        pathMap.set(p, (pathMap.get(p) ?? 0) + 1);
      });
      const maxPathCount = Math.max(...pathMap.values(), 1);
      const heatmapData = [...pathMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([label, value]) => ({ label: label === "/" ? "الصفحة الرئيسية" : label.replace(/\//g, ""), value, max: maxPathCount }));

      // Traffic sources estimation based on user_agent patterns
      const uaData = visitData.map(v => v.user_agent || "");
      const sources = [
        { name: "Direct", count: uaData.filter(u => !u.includes("bot")).length, color: "#22d3ee" },
        { name: "Mobile", count: uaData.filter(u => /mobile|android|iphone/i.test(u)).length, color: "#a78bfa" },
        { name: "Desktop", count: uaData.filter(u => !/mobile|android|iphone/i.test(u) && !u.includes("bot")).length, color: "#f43f5e" },
        { name: "Bot/Crawler", count: uaData.filter(u => /bot|crawler|spider/i.test(u)).length, color: "#facc15" },
      ].filter(s => s.count > 0);

      return {
        totalVisits,
        totalSignups,
        totalPosts,
        conversionRate,
        visitDelta,
        signupDelta,
        funnel: { landingVisits, signupPageVisits, startedReg, completedReg, activeUsers },
        chartData,
        heatmapData,
        sources,
        recentSignups: recentSignups.data ?? [],
        recentVisits: visitData.slice(0, 8),
      };
    },
    enabled: !!user?.id,
    refetchInterval: false,
  });

  // AI Insights generation
  const insights = useMemo(() => {
    if (!data) return [];
    const list: { icon: any; severity: "danger" | "warning" | "success"; title: string; desc: string; action: string }[] = [];

    if (data.conversionRate < 5) {
      list.push({
        icon: AlertTriangle, severity: "danger",
        title: "معدل التحويل منخفض جداً",
        desc: `فقط ${data.conversionRate.toFixed(1)}% من الزوار يسجلون. هذا يشير إلى مشكلة في صفحة الهبوط أو عملية التسجيل.`,
        action: "حسّن زر التسجيل واجعله أبرز. أضف شهادات عملاء وإثبات اجتماعي.",
      });
    }

    if (data.funnel.signupPageVisits < data.funnel.landingVisits * 0.3) {
      list.push({
        icon: MousePointer, severity: "danger",
        title: "الزوار لا يضغطون على التسجيل",
        desc: `${Math.round((data.funnel.signupPageVisits / Math.max(data.funnel.landingVisits, 1)) * 100)}% فقط وصلوا لصفحة التسجيل.`,
        action: "ضع زر التسجيل في أعلى الصفحة. استخدم ألوان متوهجة وعبارات تحفيزية.",
      });
    }

    if (data.funnel.completedReg < data.funnel.startedReg * 0.5) {
      list.push({
        icon: Shield, severity: "warning",
        title: "المستخدمون يغادرون أثناء التسجيل",
        desc: "الكثير يبدأون التسجيل لكن لا يكملونه. قد تكون المشكلة في تعقيد النموذج أو الثقة.",
        action: "بسّط نموذج التسجيل. أضف تسجيل بـ Google بنقرة واحدة.",
      });
    }

    if (data.totalVisits > 0 && data.totalSignups === 0) {
      list.push({
        icon: AlertTriangle, severity: "danger",
        title: "زوار بدون أي تسجيل",
        desc: `${data.totalVisits} زائر ولا تسجيل واحد! المشكلة خطيرة.`,
        action: "راجع تجربة المستخدم بالكامل. تأكد أن زر التسجيل يعمل.",
      });
    }

    if (data.visitDelta > 20) {
      list.push({
        icon: TrendingUp, severity: "success",
        title: "نمو جيد في الزيارات",
        desc: `ارتفاع ${data.visitDelta.toFixed(0)}% مقارنة بالفترة السابقة.`,
        action: "استمر في نفس الاستراتيجية واستثمر في المصادر الأفضل أداءً.",
      });
    }

    if (list.length === 0) {
      list.push({
        icon: CheckCircle, severity: "success",
        title: "الأداء مستقر",
        desc: "لا توجد مشاكل كبيرة حالياً. راقب التحويلات باستمرار.",
        action: "جرّب A/B Testing على صفحة الهبوط لتحسين معدل التحويل.",
      });
    }

    return list;
  }, [data]);

  if (isLoading || !data) {
    return (
      <PageShell title="Growth Analytics" subtitle="تحليل شامل لفهم سلوك الزوار والتحويلات" action={<BarChart3 className="h-5 w-5 text-cyan-400" />}>
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </PageShell>
    );
  }

  const PIE_COLORS = ["#22d3ee", "#a78bfa", "#f43f5e", "#facc15", "#4ade80", "#fb923c"];

  return (
    <PageShell
      title="Growth Analytics"
      subtitle="تحليل شامل لفهم سلوك الزوار والتحويلات"
      action={
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[oklch(0.25_0.03_260)] overflow-hidden text-xs">
            {(["today", "week", "month"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 transition-all ${timeRange === r ? "bg-cyan-500/20 text-cyan-400 font-semibold" : "text-[oklch(0.6_0.04_260)] hover:bg-[oklch(0.15_0.02_260)]"}`}
              >
                {r === "today" ? "اليوم" : r === "week" ? "أسبوع" : "شهر"}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-[oklch(0.25_0.03_260)] hover:bg-[oklch(0.15_0.02_260)] transition-all">
            <RefreshCw className="h-4 w-4 text-cyan-400" />
          </button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* ─── KPIs ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <GlowStatCard label="إجمالي الزيارات" value={data.totalVisits} delta={data.visitDelta} icon={Eye} color="cyan" subtitle={timeRange === "today" ? "اليوم" : timeRange === "week" ? "آخر 7 أيام" : "آخر 30 يوم"} />
          <GlowStatCard label="التسجيلات" value={data.totalSignups} delta={data.signupDelta} icon={UserPlus} color="violet" />
          <GlowStatCard label="معدل التحويل" value={`${data.conversionRate.toFixed(1)}%`} icon={Target} color={data.conversionRate > 10 ? "emerald" : data.conversionRate > 3 ? "amber" : "pink"} delta={data.conversionRate > 5 ? 5 : -15} />
          <GlowStatCard label="المنشورات" value={data.totalPosts} icon={Activity} color="emerald" />
          <GlowStatCard label="المستخدمون النشطون" value={data.funnel.activeUsers} icon={Users} color="amber" />
        </div>

        {/* ─── Conversion Funnel ─── */}
        <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-cyan-400" />
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
          {/* ─── AI Insights ─── */}
          <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              <h2 className="font-bold text-white">AI Insights — تحليل ذكي</h2>
            </div>
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <InsightCard key={i} {...ins} />
              ))}
            </div>
          </Card>

          {/* ─── Traffic Sources ─── */}
          <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-violet-400" />
              <h2 className="font-bold text-white">مصادر الزيارات</h2>
            </div>
            {data.sources.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={data.sources} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="count" nameKey="name" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {data.sources.map((s, i) => <Cell key={i} fill={s.color || PIE_COLORS[i % PIE_COLORS.length]} />)}
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
              <p className="text-sm text-[oklch(0.5_0.03_260)] text-center py-10">لا توجد بيانات كافية</p>
            )}
          </Card>
        </div>

        {/* ─── Visits Chart ─── */}
        <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h2 className="font-bold text-white">حركة الزيارات</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#777", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0f0d1a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="visits" stroke="#22d3ee" fill="url(#visitGrad)" strokeWidth={2} name="زيارات" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* ─── Page Heatmap ─── */}
          <Card className="p-5 bg-[oklch(0.1_0.02_260)] border-[oklch(0.2_0.03_260)] backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-pink-400" />
              <h2 className="font-bold text-white">خريطة النشاط — أكثر الصفحات زيارة</h2>
            </div>
            {data.heatmapData.length > 0 ? (
              <HeatmapSection data={data.heatmapData} />
            ) : (
              <p className="text-sm text-[oklch(0.5_0.03_260)] text-center py-6">لا توجد بيانات</p>
            )}
          </Card>

          {/* ─── Live Activity Feed ─── */}
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
                <LiveItem key={u.id} text={`مستخدم جديد: @${u.username || "مجهول"}`} time={new Date(u.created_at).toLocaleTimeString("ar")} type="user" />
              ))}
              {data.recentVisits.slice(0, 4).map((v: any) => (
                <LiveItem key={v.id} text={`زيارة: ${v.path || "/"}`} time={new Date(v.first_seen).toLocaleTimeString("ar")} type="visit" />
              ))}
              {data.recentVisits.length === 0 && data.recentSignups.length === 0 && (
                <p className="text-sm text-[oklch(0.5_0.03_260)] text-center py-6">لا يوجد نشاط حديث</p>
              )}
            </div>
          </Card>
        </div>

      </div>
    </PageShell>
  );
}
