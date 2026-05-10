import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Play, Youtube, Film, ArrowLeft } from "lucide-react";

type ChannelVideo = {
  id: string;
  video_id: string;
  video_url: string;
  title: string | null;
  thumbnail: string | null;
  author: string | null;
  published_at: string | null;
};

export function ChannelVideosSection({ lang = "ar" }: { lang?: string }) {
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("channel_videos")
        .select("id, video_id, video_url, title, thumbnail, author, published_at")
        .eq("is_published", true)
        .eq("show_in_feed", true)
        .order("published_at_app", { ascending: false })
        .limit(8);
      if (active) {
        setVideos((data ?? []) as ChannelVideo[]);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading || videos.length === 0) return null;

  const isAr = lang === "ar";

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      <div className="container mx-auto max-w-7xl relative">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-600/30 text-red-400 text-xs font-semibold mb-3">
              <Youtube className="h-3.5 w-3.5" />
              {isAr ? "فيديوهات القنوات" : "Channel Videos"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {isAr ? "أحدث الفيديوهات من قنواتنا" : "Latest from our channels"}
            </h2>
            <p className="text-sm text-white/60 mt-1">
              {isAr
                ? "محتوى مستورد من قنوات أعضاء المجتمع"
                : "Imported content from community channels"}
            </p>
          </div>
          <Link
            to="/reels"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Film className="h-4 w-4" />
            {isAr ? "افتح Reels" : "Open Reels"}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((v) => (
            <Link
              key={v.id}
              to="/watch-yt/$videoId"
              params={{ videoId: v.video_id }}
              className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-red-500/50 transition-all hover:scale-[1.02]"
            >
              <div className="relative aspect-video bg-black">
                {v.thumbnail ? (
                  <img
                    src={v.thumbnail}
                    alt={v.title || ""}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Youtube className="h-10 w-10 text-red-500/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-14 w-14 rounded-full bg-red-600 shadow-lg shadow-red-600/50 flex items-center justify-center">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-white line-clamp-2 leading-snug mb-1">
                  {v.title}
                </p>
                {v.author && (
                  <p className="text-xs text-white/50 truncate">{v.author}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
