import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/games")({
  component: () => (
    <PageShell title="Games Hub" subtitle="ألعاب اجتماعية تلعبها مع أصدقائك مباشرة">
      <CatalogGrid
        type="game"
        cardIcon={Gamepad2}
        ctaLabel="العب"
        accent="violet"
        emptyText="لا توجد ألعاب بعد"
        onAction={(item) => toast.success(`جاري تحميل ${item.title}...`)}
      />
    </PageShell>
  ),
});
