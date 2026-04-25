import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { StatCard } from "@/components/catalog/MetricsDashboard";
import { Mail, Users, MousePointerClick, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/email-dashboard")({
  component: EmailDashboardPage,
});

function EmailDashboardPage() {
  return (
    <PageShell title="Email Dashboard" subtitle="قوالب وإحصاءات حملاتك البريدية">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="مرسلة" value="12.4K" delta={8.2} icon={Mail} accent="cyan" />
          <StatCard label="فتحت" value="64%" delta={3.1} icon={Users} accent="violet" />
          <StatCard label="نقرات" value="18%" delta={-1.4} icon={MousePointerClick} accent="pink" />
          <StatCard label="ارتداد" value="2.1%" delta={-0.5} icon={AlertTriangle} accent="emerald" />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">قوالب البريد</h3>
          <CatalogGrid
            type="email_template"
            cardIcon={Mail}
            ctaLabel="معاينة"
            accent="violet"
            emptyText="لا توجد قوالب"
            onAction={(item) => toast.info(`معاينة: ${item.title}`)}
          />
        </div>
      </div>
    </PageShell>
  );
}
