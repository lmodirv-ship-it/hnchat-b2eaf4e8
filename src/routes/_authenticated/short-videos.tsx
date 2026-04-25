import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { Film } from "lucide-react";

export const Route = createFileRoute("/_authenticated/short-videos")({
  component: () => (
    <PageShell title="Short Videos" subtitle="مقاطع 60 ثانية بأسلوب Reels & Shorts">
      <ComingSoon
        icon={Film}
        title="Short Videos 🎞️"
        description="موجز فيديوهات قصيرة عمودية مع موسيقى، فلاتر، وتحرير سريع داخل التطبيق."
        features={[
          "مكتبة موسيقى مرخّصة بالكامل",
          "فلاتر AR واستديو تحرير مدمج",
          "Duets و Stitch مع منشئين آخرين",
          "ترند يومي حسب موقعك",
        ]}
      />
    </PageShell>
  ),
});
