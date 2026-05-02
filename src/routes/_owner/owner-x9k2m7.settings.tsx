import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerCard } from "@/components/owner/OwnerShell";
import { Settings, Globe, Database, Server, Shield, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_owner/owner-x9k2m7/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: siteStats } = useQuery({
    queryKey: ["owner-settings-stats"],
    queryFn: async () => {
      const [visits, profiles, posts, products] = await Promise.all([
        supabase.from("site_visits").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
      ]);
      return {
        visits: visits.count ?? 0,
        profiles: profiles.count ?? 0,
        posts: posts.count ?? 0,
        products: products.count ?? 0,
      };
    },
  });

  const settings = [
    { label: "اسم المنصة", value: "hnChat", icon: Globe },
    { label: "الدومين", value: "www.hn-chat.com", icon: ExternalLink },
    { label: "قاعدة البيانات", value: "Lovable Cloud", icon: Database },
    { label: "الاستضافة", value: "Edge (Cloudflare)", icon: Server },
    { label: "الحماية", value: "RLS + Security Definer", icon: Shield },
  ];

  return (
    <OwnerShell title="System Settings" subtitle="إعدادات وتكوين النظام">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4 text-[oklch(0.75_0.18_50)]" /> تكوين المنصة
          </h2>
          <div className="space-y-3">
            {settings.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center justify-between p-3 rounded-lg bg-[oklch(0.06_0.02_30)]">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[oklch(0.6_0.04_40)]" />
                    <span className="text-sm text-[oklch(0.7_0.04_40)]">{s.label}</span>
                  </div>
                  <span className="text-sm font-medium text-[oklch(0.9_0.05_50)]">{s.value}</span>
                </div>
              );
            })}
          </div>
        </OwnerCard>

        <OwnerCard className="p-5">
          <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-[oklch(0.75_0.18_50)]" /> ملخص البيانات
          </h2>
          <div className="space-y-3">
            {[
              { label: "زيارات الموقع", value: siteStats?.visits ?? 0 },
              { label: "المستخدمون", value: siteStats?.profiles ?? 0 },
              { label: "المنشورات", value: siteStats?.posts ?? 0 },
              { label: "المنتجات", value: siteStats?.products ?? 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-[oklch(0.06_0.02_30)]">
                <span className="text-sm text-[oklch(0.7_0.04_40)]">{item.label}</span>
                <span className="text-lg font-bold text-[oklch(0.9_0.05_50)]">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </OwnerCard>
      </div>

      <OwnerCard className="p-5">
        <h2 className="font-semibold text-[oklch(0.9_0.05_50)] mb-3">معلومات تقنية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            ["Framework", "TanStack Start v1"],
            ["Runtime", "Cloudflare Workers"],
            ["Database", "PostgreSQL (Lovable Cloud)"],
            ["Auth", "Supabase Auth + RLS"],
            ["Styling", "Tailwind CSS v4"],
            ["State", "TanStack Query"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between p-2 rounded bg-[oklch(0.06_0.02_30)]">
              <span className="text-[oklch(0.55_0.04_40)] font-mono">{k}</span>
              <span className="text-[oklch(0.8_0.04_40)]">{v}</span>
            </div>
          ))}
        </div>
      </OwnerCard>
    </OwnerShell>
  );
}
