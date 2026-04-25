import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { Gamepad2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/games")({
  component: () => (
    <PageShell title="Games Hub" subtitle="ألعاب اجتماعية للعب مع الأصدقاء">
      <ComingSoon
        icon={Gamepad2}
        title="Games Hub 🎮"
        description="ألعاب سريعة متعددة اللاعبين بداخل المحادثات — تحدّى أصدقاءك واربح نقاطاً."
        features={[
          "ألعاب 1v1 و multiplayer",
          "لوحة متصدّرين أسبوعية",
          "نقاط XP وإنجازات",
          "بثّ مباشر للمباريات",
        ]}
      />
    </PageShell>
  ),
});
