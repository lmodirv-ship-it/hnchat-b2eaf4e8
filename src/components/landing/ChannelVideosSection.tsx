import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Play, Film, ArrowLeft, Eye, Heart, MessageCircle, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type ChannelVideo = {
  id: string;
  short_id: string | null;
  video_id: string;
  video_url: string;
  title: string | null;
  thumbnail: string | null;
  published_at: string | null;
  post_id: string | null;
  likes?: number;
  comments?: number;
  views?: number;
};

function formatCount(n?: number) {
  const v = n ?? 0;
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return String(v);
}

export function ChannelVideosSection({ lang = "ar" }: { lang?: string }) {
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const isAr = lang === "ar";

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("channel_videos")
        .select("id, video_id, video_url, title, thumbnail, published_at, post_id")
        .eq("is_published", true)
        .eq("show_in_feed", true)
        .order("published_at_app", { ascending: false })
        .limit(8);
      const rows = (data ?? []) as ChannelVideo[];
      const postIds = rows.map((v) => v.post_id).filter(Boolean) as string[];
      const stats = new Map<string, { likes: number; comments: number; views: number }>();
      if (postIds.length > 0) {
        const { data: pstats } = await supabase
          .from("posts")
          .select("id, likes_count, comments_count, views_count")
          .in("id", postIds);
        (pstats ?? []).forEach((p: any) =>
          stats.set(p.id, {
            likes: p.likes_count ?? 0,
            comments: p.comments_count ?? 0,
            views: p.views_count ?? 0,
          }),
        );
      }
      const enriched = rows.map((v) => {
        const s = v.post_id ? stats.get(v.post_id) : undefined;
        return { ...v, likes: s?.likes, comments: s?.comments, views: s?.views };
      });
      if (active) {
        setVideos(enriched);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleShare = async (e: React.MouseEvent, v: ChannelVideo) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/watch-yt/${v.video_id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: v.title || "Video", url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(isAr ? "تم نسخ الرابط" : "Link copied");
      }
    } catch {
      // cancelled
    }
  };

  if (loading || videos.length === 0) return null;

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      <div className="container mx-auto max-w-7xl relative">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              {isAr ? "أحدث الفيديوهات" : "Latest Videos"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {isAr ? "فيديوهات مختارة" : "Featured videos"}
            </h2>
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
              className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:scale-[1.02] flex flex-col"
            >
              <div className="relative aspect-video bg-black">
                {v.thumbnail ? (
                  <img
                    src={v.thumbnail}
                    alt={v.title || ""}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-10 w-10 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/80 transition-all">
                    <Play className="h-5 w-5 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-2 flex-1">
                <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                  {v.title}
                </p>
                <div className="mt-auto pt-2 flex items-center gap-3 text-[11px] text-white/55 border-t border-white/5">
                  <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{formatCount(v.views)}</span>
                  <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" />{formatCount(v.likes)}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{formatCount(v.comments)}</span>
                  <button
                    onClick={(e) => handleShare(e, v)}
                    className="ms-auto inline-flex items-center gap-1 hover:text-white transition"
                    aria-label={isAr ? "مشاركة" : "Share"}
                  >
                    <Share2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
