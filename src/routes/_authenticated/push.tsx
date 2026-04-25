import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/push")({
  component: () => (
    <PageShell title="Push Strategy" subtitle="إدارة إشعارات Push الذكية">
      <ComingSoon
        icon={Send}
        title="Push Strategy 🔔"
        description="أنشئ حملات إشعارات مخصّصة بناءً على سلوك المستخدمين والمنطقة الزمنية."
        features={[
          "إشعارات مخصّصة حسب الشريحة",
          "A/B testing للنصوص",
          "جدولة حسب التوقيت المحلي",
          "تحليلات معدّل الفتح",
        ]}
      />
    </PageShell>
  ),
});
