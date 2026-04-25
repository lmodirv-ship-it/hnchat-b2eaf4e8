import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { VideoFeed } from "@/components/videos/VideoFeed";

export const Route = createFileRoute("/_authenticated/short-videos")({
  component: () => (
    <PageShell title="Short Videos" subtitle="مقاطع 60 ثانية بأسلوب Reels & Shorts">
      <VideoFeed feedType="short" storageKey="short-videos" />
    </PageShell>
  ),
});
