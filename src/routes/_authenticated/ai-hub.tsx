import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ai-hub")({
  component: () => (
    <PageShell title="Ai hub" subtitle="Coming soon to your hnChat experience">
      <Card className="p-12 bg-ice-card border-ice-border text-center backdrop-blur-xl">
        <Sparkles className="h-10 w-10 mx-auto mb-3 text-violet-glow" />
        <p className="text-muted-foreground">This feature is being polished — stay tuned</p>
      </Card>
    </PageShell>
  ),
});
