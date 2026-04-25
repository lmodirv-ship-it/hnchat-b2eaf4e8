import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { StoriesRail } from "@/components/stories/StoriesRail";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/stories")({
  component: StoriesPage,
});

function StoriesPage() {
  return (
    <PageShell title="القصص" subtitle="قصص مرئية تختفي بعد 24 ساعة">
      <StoriesRail />
      <Card className="p-8 bg-ice-card border-ice-border text-center mt-4">
        <Sparkles className="h-8 w-8 mx-auto mb-3 text-violet-glow" />
        <p className="text-sm text-muted-foreground">
          أنشئ قصة من الزر أعلاه واضغط على دائرة أي مستخدم لمشاهدة قصصه
        </p>
      </Card>
    </PageShell>
  );
}
