import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/growth")({
  component: () => (
    <PageShell title="Growth Analytics" subtitle="إحصائيات نمو حسابك ومحتواك">
      <ComingSoon
        icon={BarChart3}
        title="Growth Analytics 📈"
        description="تحليلات تفصيلية لأداء منشوراتك، نموّ متابعيك، وأفضل أوقات النشر."
        features={[
          "نموّ المتابعين بالوقت الفعلي",
          "أفضل أوقات النشر حسب جمهورك",
          "أداء كل منشور بالتفصيل",
          "تقارير أسبوعية بالبريد",
        ]}
      />
    </PageShell>
  ),
});
