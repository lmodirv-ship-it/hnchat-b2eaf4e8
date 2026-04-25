import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { Store } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app-store")({
  component: () => (
    <PageShell title="App Store" subtitle="إضافات وتطبيقات صغيرة داخل hnChat">
      <ComingSoon
        icon={Store}
        title="hnChat App Store 🧩"
        description="مكتبة تطبيقات وإضافات (mini-apps) تعمل داخل hnChat — من ألعاب وأدوات إنتاجية إلى بوتات ذكية."
        features={[
          "Mini-apps تعمل بدون تنزيل",
          "SDK للمطوّرين الخارجيين",
          "نظام تقييم ومراجعات",
          "تكامل مع المحفظة والدفع",
        ]}
      />
    </PageShell>
  ),
});
