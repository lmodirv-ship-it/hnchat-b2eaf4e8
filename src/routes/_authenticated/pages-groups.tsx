import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Users, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pages-groups")({
  component: () => (
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
          <div className="mt-3 text-xs text-cyan-glow group-hover:underline">استكشف المجموعات →</div>
        </Link>

        <div className="rounded-2xl border border-ice-border bg-ice-card p-6 opacity-70">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-glow/30 to-pink-glow/20 border border-violet-glow/40 flex items-center justify-center mb-3">
            <FileText className="h-6 w-6 text-violet-glow" />
          </div>
          <h3 className="text-lg font-bold mb-1">Pages</h3>
          <p className="text-sm text-muted-foreground">
            صفحات رسمية للأعمال والعلامات التجارية والشخصيات العامة.
          </p>
          <div className="mt-3 text-xs text-violet-glow">قريباً ✨</div>
        </div>
      </div>
    </PageShell>
  ),
});
