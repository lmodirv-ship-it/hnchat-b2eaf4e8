import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/monitoring")({
  component: () => (
    <PageShell title="Monitoring Pro" subtitle="مراقبة الأداء والأخطاء بالوقت الفعلي">
      <ComingSoon
        icon={Activity}
        title="Monitoring Pro 🛡️"
        description="مراقبة شاملة لـ uptime، performance، وأخطاء التطبيق مع تنبيهات فورية."
        features={[
          "تنبيهات فورية عبر Push & Email",
          "خرائط حرارية للأخطاء",
          "تتبّع أداء API لكل endpoint",
          "تقارير SLA شهرية",
        ]}
      />
    </PageShell>
  ),
});
