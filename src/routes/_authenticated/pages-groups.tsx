import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Users, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/pages-groups")({
  component: PagesGroupsPage,
});

function PagesGroupsPage() {
  const { data: counts } = useQuery({
    queryKey: ["pg-counts"],
    queryFn: async () => {
      const [{ count: g }, { count: p }] = await Promise.all([
        supabase.from("groups").select("*", { count: "exact", head: true }),
        supabase.from("catalog_items").select("*", { count: "exact", head: true }).eq("type", "page"),
      ]);
      return { groups: g ?? 0, pages: p ?? 0 };
    },
  });

  return (
    <PageShell title="Pages & Groups" subtitle="مجتمعاتك ومحتواك في مكان واحد">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/groups"
          className="rounded-2xl border border-ice-border bg-ice-card p-6 hover:border-cyan-glow/50 hover:shadow-[0_0_30px_oklch(0.78_0.18_220/0.2)] transition-all group"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-glow/30 to-violet-glow/20 border border-cyan-glow/40 flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-cyan-glow" />
          </div>
          <h3 className="text-lg font-bold mb-1">Groups</h3>
          <p className="text-sm text-muted-foreground">
            انضم إلى مجموعات حول اهتماماتك وشارك محتواك مع آلاف الأعضاء.
          </p>
          <div className="mt-3 text-xs text-cyan-glow">
            {counts?.groups ?? 0} مجموعة • استكشف →
          </div>
        </Link>

        <Link
          to="/app-store"
          className="rounded-2xl border border-ice-border bg-ice-card p-6 hover:border-violet-glow/50 transition-all group"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-glow/30 to-pink-glow/20 border border-violet-glow/40 flex items-center justify-center mb-3">
            <FileText className="h-6 w-6 text-violet-glow" />
          </div>
          <h3 className="text-lg font-bold mb-1">Pages</h3>
          <p className="text-sm text-muted-foreground">
            صفحات رسمية للأعمال والعلامات التجارية والشخصيات العامة.
          </p>
          <div className="mt-3 text-xs text-violet-glow">
            {counts?.pages ?? 0} صفحة • تصفّح →
          </div>
        </Link>
      </div>
    </PageShell>
  );
}
