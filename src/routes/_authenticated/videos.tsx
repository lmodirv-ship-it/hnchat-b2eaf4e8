import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { VideoFeed } from "@/components/videos/VideoFeed";

export const Route = createFileRoute("/_authenticated/videos")({
  component: () => (
    <PageShell title="الفيديوهات" subtitle="مقاطع قصيرة بأسلوب TikTok">
      <VideoFeed />
    </PageShell>
  ),
});
