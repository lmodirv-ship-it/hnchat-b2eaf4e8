import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/live")({
  component: () => (
    <PageShell
      title="Live Stream"
      subtitle="بثوث مباشرة من المنشئين حول العالم"
      action={
        <Badge variant="outline" className="border-pink-glow/50 text-pink-glow gap-1">
          <Radio className="h-3 w-3 animate-pulse" /> LIVE
        </Badge>
      }
    >
      <CatalogGrid type="live_stream" />
    </PageShell>
  ),
});
