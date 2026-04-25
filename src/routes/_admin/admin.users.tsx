import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/users")({
  component: () => (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-glow to-cyan-glow bg-clip-text text-transparent">Users</h1>
      <Card className="p-12 bg-ice-card border-ice-border text-center backdrop-blur-xl">
        <Sparkles className="h-10 w-10 mx-auto mb-3 text-pink-glow" />
        <p className="text-muted-foreground">Users management UI ready for build-out</p>
      </Card>
    </div>
  ),
});
