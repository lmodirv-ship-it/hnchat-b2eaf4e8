import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerCard, OwnerStat } from "@/components/owner/OwnerShell";
import { Globe, Languages, MapPin, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_owner/owner/geography")({
  component: GeographyPage,
});

function GeographyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["owner-geo"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("country_code, language_code").limit(5000);
      const countries = new Map<string, number>();
      const langs = new Map<string, number>();
      let hasGeo = 0;
      (profiles ?? []).forEach((p) => {
        if (p.country_code) { countries.set(p.country_code, (countries.get(p.country_code) ?? 0) + 1); hasGeo++; }
        if (p.language_code) langs.set(p.language_code, (langs.get(p.language_code) ?? 0) + 1);
      });
      return {
        total: profiles?.length ?? 0,
        hasGeo,
        countries: [...countries.entries()].sort((a, b) => b[1] - a[1]),
        languages: [...langs.entries()].sort((a, b) => b[1] - a[1]),
      };
    },
  });

  return (
    <OwnerShell title="Geo & Language" subtitle="توزيع المستخدمين الجغرافي واللغوي">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <OwnerStat label="إجمالي المستخدمين" value={data?.total ?? "—"} icon={Globe} accent="cyan" />
        <OwnerStat label="لديهم موقع" value={data?.hasGeo ?? "—"} icon={MapPin} accent="amber" />
        <OwnerStat label="لغات" value={data?.languages.length ?? "—"} icon={Languages} accent="rose" />
      </div>

      {isLoading ? (
        <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-[oklch(0.75_0.18_50)] mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OwnerCard className="p-5">
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2"><Globe className="h-4 w-4 text-[oklch(0.75_0.18_50)]" />الدول ({data?.countries.length})</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {data?.countries.map(([code, count]) => {
                const pct = data.total ? (count / data.total) * 100 : 0;
                return (
                  <div key={code}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[oklch(0.85_0.05_50)]">{code}</span>
                      <span className="text-[oklch(0.55_0.04_40)]">{count} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-1.5 bg-[oklch(0.12_0.03_30)] rounded overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[oklch(0.75_0.18_50)] to-[oklch(0.55_0.22_25)]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {data?.countries.length === 0 && <p className="text-sm text-[oklch(0.5_0.04_40)]">لا توجد بيانات بعد</p>}
            </div>
          </OwnerCard>

          <OwnerCard className="p-5">
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2"><Languages className="h-4 w-4 text-[oklch(0.75_0.18_50)]" />اللغات ({data?.languages.length})</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {data?.languages.map(([code, count]) => {
                const pct = data.total ? (count / data.total) * 100 : 0;
                return (
                  <div key={code}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-[oklch(0.85_0.05_50)] uppercase">{code}</span>
                      <span className="text-[oklch(0.55_0.04_40)]">{count} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-1.5 bg-[oklch(0.12_0.03_30)] rounded overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-glow to-violet-glow" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {data?.languages.length === 0 && <p className="text-sm text-[oklch(0.5_0.04_40)]">لا توجد بيانات بعد</p>}
            </div>
          </OwnerCard>
        </div>
      )}
    </OwnerShell>
  );
}
