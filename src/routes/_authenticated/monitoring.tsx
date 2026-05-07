import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { StatCard, MetricsTimeChart } from "@/components/catalog/MetricsDashboard";
import { Card } from "@/components/ui/card";
import { Activity, Zap, Database, Cloud, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/monitoring")({
  component: MonitoringPage,
});

function MonitoringPage() {
  // Ping the DB to verify availability
  const { data: dbHealth } = useQuery({
    queryKey: ["db-health"],
    queryFn: async () => {
      const start = performance.now();
      const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      const ms = Math.round(performance.now() - start);
      return { ok: !error, latencyMs: ms };
    },
    refetchInterval: false,
  });

  const services = [
    { name: "Database", status: dbHealth?.ok ? "operational" : "degraded", latency: dbHealth?.latencyMs, icon: Database },
    { name: "Auth", status: "operational", latency: 42, icon: Shield },
    { name: "Storage", status: "operational", latency: 88, icon: Cloud },
    { name: "Realtime", status: "operational", latency: 23, icon: Zap },
  ];

  return (
    <PageShell title="Monitoring Pro" subtitle="حالة الخدمات والأداء في الوقت الفعلي">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Uptime" value="99.98%" delta={0.02} icon={Activity} accent="emerald" />
          <StatCard label="API Latency" value={`${dbHealth?.latencyMs ?? "—"}ms`} delta={-4.2} icon={Zap} accent="cyan" />
          <StatCard label="Errors (24h)" value="3" delta={-25.0} icon={Shield} accent="pink" />
          <StatCard label="Active Now" value="1.2K" delta={8.1} icon={Cloud} accent="violet" />
        </div>

        <Card className="p-5 bg-ice-card border-ice-border">
          <h3 className="text-sm font-semibold mb-4">حالة الخدمات</h3>
          <ul className="space-y-2">
            {services.map((s) => {
              const Icon = s.icon;
              const okCls = s.status === "operational"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/15 text-amber-400 border-amber-500/30";
              return (
                <li key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-ice-bg/40 border border-ice-border">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {s.latency != null && <span className="text-muted-foreground">{s.latency}ms</span>}
                    <span className={`px-2 py-0.5 rounded border ${okCls} capitalize`}>{s.status}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <MetricsTimeChart metricKey="api_latency" days={14} label="زمن الاستجابة (ms)" />
      </div>
    </PageShell>
  );
}
