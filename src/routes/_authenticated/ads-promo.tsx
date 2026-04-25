import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ads-promo")({
  component: () => (
    <PageShell
      title="Ads & Promo"
      subtitle="عروض ترويجية وأكواد خصم لحملاتك"
      action={
        <Link
          to="/ads-manager"
          className="text-xs px-3 py-1.5 rounded-lg bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/40 hover:bg-cyan-glow/25 transition"
        >
          فتح Ads Manager →
        </Link>
      }
    >
      <ComingSoon
        icon={Zap}
        title="عروض ترويجية ذكية ⚡"
        description="أنشئ أكواد خصم، عروض محدودة المدة، وحملات ترويج تلقائية مدمجة مع Ads Manager."
        features={[
          "أكواد خصم قابلة للمشاركة",
          "Flash sales بمؤقت تنازلي",
          "ترويج تلقائي للحملات الأكثر أداءً",
          "تكامل كامل مع Ads Manager",
        ]}
      />
    </PageShell>
  ),
});
