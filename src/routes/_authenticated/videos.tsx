import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";

export const Route = createFileRoute("/_authenticated/videos")({
  component: () => (
    <PageShell title="Videos" subtitle="Short-form content">
      <Card className="p-12 bg-ice-card border-ice-border text-center">
        <Video className="h-12 w-12 mx-auto mb-3 text-violet-glow" />
        <p className="text-muted-foreground">Video feed coming online soon ✨</p>
      </Card>
    </PageShell>
  ),
});
