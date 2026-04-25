import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages")({
  component: () => (
    <PageShell title="Messages" subtitle="Realtime conversations">
      <Card className="p-12 bg-ice-card border-ice-border text-center">
        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-cyan-glow" />
        <p className="text-muted-foreground">No conversations yet. Start chatting with friends!</p>
      </Card>
    </PageShell>
  ),
});
