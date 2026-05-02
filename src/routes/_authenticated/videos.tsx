import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { VideoFeed } from "@/components/videos/VideoFeed";

export const Route = createFileRoute("/_authenticated/videos")({
  head: () => ({
    meta: [
      { title: "الفيديوهات — HN-Chat | مقاطع قصيرة" },
      { name: "description", content: "شاهد مقاطع فيديو قصيرة بأسلوب TikTok على منصة HN-Chat." },
    ],
  }),
  component: () => (
    <PageShell title="الفيديوهات" subtitle="مقاطع قصيرة بأسلوب TikTok">
      <VideoFeed />
    </PageShell>
  ),
});
