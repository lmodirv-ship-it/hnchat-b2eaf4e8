import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type MetricRow = { metric_key: string; value: number; recorded_at: string };

export function StatCard({
  label, value, delta, icon: Icon, accent = "cyan",
}: {
  label: string; value: string | number; delta?: number; icon: LucideIcon; accent?: "cyan" | "violet" | "pink" | "emerald";
}) {
  const accentCls =
    accent === "violet" ? "from-violet-glow/20 to-pink-glow/10 text-violet-glow border-violet-glow/30" :
    accent === "pink" ? "from-pink-glow/20 to-violet-glow/10 text-pink-glow border-pink-glow/30" :
    accent === "emerald" ? "from-emerald-500/20 to-cyan-glow/10 text-emerald-400 border-emerald-500/30" :
    "from-cyan-glow/20 to-violet-glow/10 text-cyan-glow border-cyan-glow/30";

  const TrendIcon = (delta ?? 0) >= 0 ? TrendingUp : TrendingDown;
  const trendColor = (delta ?? 0) >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <Card className="p-4 bg-ice-card border-ice-border">
      <div className="flex items-start justify-between">
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br border ${accentCls} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        {delta != null && (
          <span className={`text-xs flex items-center gap-0.5 ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </Card>
  );
}

export function MetricsTimeChart({ metricKey, days = 14, label }: { metricKey: string; days?: number; label: string }) {
  const { user } = useAuth();

  const { data: rows = [] } = useQuery({
    queryKey: ["metrics", user?.id, metricKey, days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("user_metrics")
        .select("metric_key, value, recorded_at")
        .eq("user_id", user!.id)
        .eq("metric_key", metricKey)
        .gte("recorded_at", since)
        .order("recorded_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MetricRow[];
    },
    enabled: !!user?.id,
  });

  const chartData = useMemo(() => {
    if (rows.length === 0) {
      // Generate sample illustrative data so the chart isn't empty for new users
      const base = 100;
      return Array.from({ length: days }).map((_, i) => ({
        day: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("ar", { month: "short", day: "numeric" }),
        value: Math.round(base + Math.sin(i / 2) * 25 + i * 4 + Math.random() * 15),
      }));
    }
    return rows.map((r) => ({
      day: new Date(r.recorded_at).toLocaleDateString("ar", { month: "short", day: "numeric" }),
      value: Number(r.value),
    }));
  }, [rows, days]);

  return (
    <Card className="p-4 bg-ice-card border-ice-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-muted-foreground">آخر {days} يوم</span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id={`grad-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.78 0.18 220)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="oklch(0.78 0.18 220)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.05 240 / 0.3)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "oklch(0.7 0.04 240)" }} />
            <YAxis tick={{ fontSize: 10, fill: "oklch(0.7 0.04 240)" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "oklch(0.18 0.04 240)", border: "1px solid oklch(0.3 0.05 240)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "oklch(0.78 0.18 220)" }}
            />
            <Area type="monotone" dataKey="value" stroke="oklch(0.78 0.18 220)" strokeWidth={2} fill={`url(#grad-${metricKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
