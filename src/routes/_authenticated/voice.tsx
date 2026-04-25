import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Mic } from "lucide-react";

export const Route = createFileRoute("/_authenticated/voice")({
  component: () => (
    <PageShell
      title="Voice Rooms"
      subtitle="انضم إلى محادثات صوتية حية مع مجتمعك"
      action={<Mic className="h-5 w-5 text-violet-glow" />}
    >
      <CatalogGrid type="voice_room" emptyTitle="لا توجد غرف نشطة" emptyDescription="ابدأ غرفة جديدة قريبًا" />
    </PageShell>
  ),
});
