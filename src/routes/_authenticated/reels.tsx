import { createFileRoute } from "@tanstack/react-router";
import { VideoFeed } from "@/components/videos/VideoFeed";

export const Route = createFileRoute("/_authenticated/reels")({
  head: () => ({
    meta: [
      { title: "Reels — hnChat" },
      { name: "description", content: "تجربة مقاطع قصيرة عمودية بنمط TikTok و Instagram Reels" },
    ],
  }),
  component: ReelsPage,
});

function ReelsPage() {
  return (
    <div className="fixed inset-0 md:relative md:h-[calc(100vh-3.5rem)] bg-black overflow-hidden">
      <VideoFeed feedType={["short", "video"]} storageKey="reels-tiktok" />
    </div>
  );
}
