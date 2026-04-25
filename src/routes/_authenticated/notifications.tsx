import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: () => (
    <PageShell title="Notifications">
      <Card className="p-12 bg-ice-card border-ice-border text-center">
        <Bell className="h-10 w-10 mx-auto mb-3 text-cyan-glow" />
        <p className="text-muted-foreground">You're all caught up</p>
      </Card>
    </PageShell>
  ),
});
