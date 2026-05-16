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
    <div className="fixed inset-x-0 top-0 bottom-16 md:relative md:bottom-0 md:h-[calc(100vh-3.5rem)] bg-black overflow-hidden">
      <VideoFeed feedType={["short", "video"]} storageKey="reels-tiktok" />
    </div>
  );
}
