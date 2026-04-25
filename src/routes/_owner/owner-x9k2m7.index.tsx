import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerStat, OwnerCard } from "@/components/owner/OwnerShell";
import { Users, FileText, ShoppingBag, MessageCircle, Globe, TrendingUp, Crown } from "lucide-react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_owner/owner-x9k2m7/")({
  component: MissionControl,
});

function MissionControl() {
  const { data, isLoading } = useQuery({
    queryKey: ["owner-overview"],
    queryFn: async () => {
      const [users, posts, products, messages, groups, byCountry, byLanguage, recentSignups] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("groups").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("country_code").not("country_code", "is", null).limit(5000),
        supabase.from("profiles").select("language_code").not("language_code", "is", null).limit(5000),
        supabase.from("profiles").select("id, username, country_code, created_at").order("created_at", { ascending: false }).limit(10),
      ]);
      const countryMap = new Map<string, number>();
      (byCountry.data ?? []).forEach((r: any) => countryMap.set(r.country_code, (countryMap.get(r.country_code) ?? 0) + 1));
      const langMap = new Map<string, number>();
      (byLanguage.data ?? []).forEach((r: any) => langMap.set(r.language_code, (langMap.get(r.language_code) ?? 0) + 1));
      return {
        users: users.count ?? 0, posts: posts.count ?? 0, products: products.count ?? 0,
        messages: messages.count ?? 0, groups: groups.count ?? 0,
        topCountries: [...countryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
        topLanguages: [...langMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
        recentSignups: recentSignups.data ?? [],
      };
    },
  });

  return (
    <OwnerShell title="Mission Control" subtitle="Real-time pulse of the entire hnChat universe">
      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.75_0.18_50)] mx-auto" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <OwnerStat label="Total Users" value={data!.users} icon={Users} accent="amber" />
            <OwnerStat label="Posts" value={data!.posts} icon={FileText} accent="cyan" />
            <OwnerStat label="Products" value={data!.products} icon={ShoppingBag} accent="rose" />
            <OwnerStat label="Messages" value={data!.messages} icon={MessageCircle} accent="cyan" />
            <OwnerStat label="Groups" value={data!.groups} icon={Crown} accent="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <OwnerCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-[oklch(0.75_0.18_50)]" />
                <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">Top Countries</h2>
              </div>
              {data!.topCountries.length === 0 ? (
                <p className="text-sm text-[oklch(0.55_0.04_40)]">No geo data yet</p>
              ) : (
                <div className="space-y-2">
                  {data!.topCountries.map(([code, count]) => {
                    const pct = (count / data!.users) * 100;
                    return (
                      <div key={code}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[oklch(0.85_0.05_50)]">{code}</span>
                          <span className="text-[oklch(0.55_0.04_40)]">{count} · {pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-[oklch(0.12_0.03_30)] rounded overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[oklch(0.75_0.18_50)] to-[oklch(0.55_0.22_25)]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </OwnerCard>

            <OwnerCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-[oklch(0.75_0.18_50)]" />
                <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">Top Languages</h2>
              </div>
              {data!.topLanguages.length === 0 ? (
                <p className="text-sm text-[oklch(0.55_0.04_40)]">No language data yet</p>
              ) : (
                <div className="space-y-2">
                  {data!.topLanguages.map(([code, count]) => {
                    const pct = (count / data!.users) * 100;
                    return (
                      <div key={code}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[oklch(0.85_0.05_50)] uppercase">{code}</span>
                          <span className="text-[oklch(0.55_0.04_40)]">{count} · {pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-[oklch(0.12_0.03_30)] rounded overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-glow to-violet-glow" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </OwnerCard>
          </div>

          <OwnerCard className="p-5">
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4">Recent Signups</h2>
            <div className="divide-y divide-[oklch(0.15_0.03_30)]">
              {data!.recentSignups.map((u: any) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-[oklch(0.88_0.04_50)]">@{u.username}</div>
                    <div className="text-xs text-[oklch(0.55_0.04_40)]">{u.country_code ?? "—"}</div>
                  </div>
                  <div className="text-xs text-[oklch(0.5_0.04_40)]">{new Date(u.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </OwnerCard>
        </>
      )}
    </OwnerShell>
  );
}
