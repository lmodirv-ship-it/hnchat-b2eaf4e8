import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, MessageSquare, Radio, Play, Activity, RefreshCw, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";

type FeedItem = {
  id: string;
  kind: "article" | "video" | "post" | "live";
  title: string;
  excerpt?: string | null;
  image?: string | null;
  url: string;
  publishedAt: string;
  postId?: string | null;
  videoId?: string | null;
  likes?: number;
  comments?: number;
  views?: number;
};

const kindMeta = {
  article: { label: { ar: "مقال", en: "Article" }, icon: Newspaper, badge: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  video: { label: { ar: "فيديو", en: "Video" }, icon: Play, badge: "bg-red-500/15 text-red-300 border-red-500/30" },
  post: { label: { ar: "منشور", en: "Post" }, icon: MessageSquare, badge: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  live: { label: { ar: "بث مباشر", en: "Live" }, icon: Radio, badge: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
} as const;

function timeAgo(iso: string, isAr: boolean) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return isAr ? "الآن" : "now";
  if (diff < 3600) return isAr ? `منذ ${Math.floor(diff / 60)} د` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return isAr ? `منذ ${Math.floor(diff / 3600)} س` : `${Math.floor(diff / 3600)}h ago`;
  return isAr ? `منذ ${Math.floor(diff / 86400)} ي` : `${Math.floor(diff / 86400)}d ago`;
}

function formatCount(n?: number) {
  const v = n ?? 0;
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return String(v);
}

export function UnifiedActivityFeed({ lang = "ar", variant = "section" }: { lang?: string; variant?: "section" | "embedded" }) {
  const isAr = lang === "ar";
  const embedded = variant === "embedded";
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [articlesRes, videosRes, postsRes, livesRes] = await Promise.all([
      supabase
        .from("articles")
        .select("id, short_id, title, short_description, featured_image, published_at, slug")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(25),
      supabase
        .from("channel_videos")
        .select("id, short_id, video_id, title, thumbnail, published_at_app, published_at, post_id")
        .eq("is_published", true)
        .eq("show_in_feed", true)
        .order("published_at_app", { ascending: false })
        .limit(25),
      supabase
        .from("posts")
        .select("id, short_id, content, media_urls, type, created_at, likes_count, comments_count, views_count")
        .order("created_at", { ascending: false })
        .limit(15),
      supabase
        .from("live_streams")
        .select("id, title, description, thumbnail_url, started_at, created_at, status")
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const merged: FeedItem[] = [];

    (articlesRes.data ?? []).forEach((a: any) => {
      merged.push({
        id: `a-${a.id}`,
        kind: "article",
        title: a.title,
        excerpt: a.short_description,
        image: a.featured_image,
        url: `/blog/${a.short_id ?? a.id}`,
        publishedAt: a.published_at ?? new Date().toISOString(),
      });
    });

    // Collect post IDs needed for channel_videos counters
    const channelPostIds = (videosRes.data ?? []).map((v: any) => v.post_id).filter(Boolean);
    let postStatsMap = new Map<string, { likes: number; comments: number; views: number }>();
    if (channelPostIds.length > 0) {
      const { data: pstats } = await supabase
        .from("posts")
        .select("id, likes_count, comments_count, views_count")
        .in("id", channelPostIds);
      (pstats ?? []).forEach((p: any) => {
        postStatsMap.set(p.id, {
          likes: p.likes_count ?? 0,
          comments: p.comments_count ?? 0,
          views: p.views_count ?? 0,
        });
      });
    }

    (videosRes.data ?? []).forEach((v: any) => {
      const stats = v.post_id ? postStatsMap.get(v.post_id) : undefined;
      merged.push({
        id: `v-${v.id}`,
        kind: "video",
        title: v.title ?? "Video",
        image: v.thumbnail,
        url: `/watch-yt/${v.short_id ?? v.video_id}`,
        publishedAt: v.published_at_app ?? v.published_at ?? new Date().toISOString(),
        postId: v.post_id,
        videoId: v.video_id,
        likes: stats?.likes,
        comments: stats?.comments,
        views: stats?.views,
      });
    });

    (postsRes.data ?? []).forEach((p: any) => {
      const text = (p.content ?? "").toString().slice(0, 180);
      const firstMedia = Array.isArray(p.media_urls) && p.media_urls[0] ? p.media_urls[0] : null;
      const ytMatch = firstMedia?.match(/[?&]v=([\w-]{11})|youtu\.be\/([\w-]{11})/);
      const ytId = ytMatch?.[1] || ytMatch?.[2];
      if (ytId) {
        merged.push({
          id: `p-${p.id}`,
          kind: "video",
          title: text || (isAr ? "فيديو" : "Video"),
          image: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          url: `/watch-yt/${ytId}`,
          publishedAt: p.created_at,
          postId: p.id,
          videoId: ytId,
          likes: p.likes_count ?? 0,
          comments: p.comments_count ?? 0,
          views: p.views_count ?? 0,
        });
      } else {
        merged.push({
          id: `p-${p.id}`,
          kind: "post",
          title: text || (isAr ? "منشور جديد" : "New post"),
          image: firstMedia,
          url: `/post/${p.id}`,
          publishedAt: p.created_at,
          postId: p.id,
          likes: p.likes_count ?? 0,
          comments: p.comments_count ?? 0,
          views: p.views_count ?? 0,
        });
      }
    });

    (livesRes.data ?? []).forEach((l: any) => {
      merged.push({
        id: `l-${l.id}`,
        kind: "live",
        title: l.title,
        excerpt: l.description,
        image: l.thumbnail_url,
        url: `/live/${l.id}`,
        publishedAt: l.started_at ?? l.created_at,
      });
    });

    // Dedupe items pointing at same post
    const seenPost = new Set<string>();
    const deduped: FeedItem[] = [];
    for (const it of merged) {
      const key = it.postId ? `post:${it.postId}` : it.id;
      if (seenPost.has(key)) continue;
      seenPost.add(key);
      deduped.push(it);
    }

    deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    setItems(deduped.slice(0, 36));
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async (e: React.MouseEvent, it: FeedItem) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${it.url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: it.title, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(isAr ? "تم نسخ الرابط" : "Link copied");
      }
    } catch {
      // cancelled
    }
  };

  const Wrapper: any = embedded ? "div" : "section";
  return (
    <Wrapper className={embedded ? "relative" : "relative py-16 px-4 overflow-hidden"} dir={isAr ? "rtl" : "ltr"}>
      <div className={embedded ? "relative" : "container mx-auto max-w-7xl relative"}>
        {!embedded && (
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3">
                <Activity className="h-3.5 w-3.5" />
                {isAr ? "كل النشاط" : "All Activity"}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {isAr ? "آخر ما يحدث في الموقع" : "Latest across the platform"}
              </h2>
              <p className="text-sm text-white/60 mt-1">
                {isAr ? "مقالات، فيديوهات، منشورات وبث مباشر — مرتبة حسب وقت النشر" : "Articles, videos, posts and live streams — sorted by publish time"}
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {isAr ? "تحديث" : "Refresh"}
            </button>
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-white/50 py-12">{isAr ? "لا يوجد نشاط بعد" : "No activity yet"}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => {
              const meta = kindMeta[it.kind];
              const Icon = meta.icon;
              const showStats = it.kind === "video" || it.kind === "post";
              return (
                <Link
                  key={it.id}
                  to={it.url}
                  className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all hover:scale-[1.01] flex flex-col"
                >
                  {it.image && (
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img src={it.image} alt={it.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {it.kind === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/80 transition-all">
                            <Play className="h-5 w-5 text-white fill-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${meta.badge}`}>
                        <Icon className="h-3 w-3" />
                        {meta.label[isAr ? "ar" : "en"]}
                      </span>
                      <span className="text-[11px] text-white/40">{timeAgo(it.publishedAt, isAr)}</span>
                    </div>
                    <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">{it.title}</p>
                    {it.excerpt && <p className="text-xs text-white/55 line-clamp-2">{it.excerpt}</p>}
                    {showStats && (
                      <div className="mt-auto pt-2 flex items-center gap-3 text-[11px] text-white/55 border-t border-white/5">
                        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{formatCount(it.views)}</span>
                        <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" />{formatCount(it.likes)}</span>
                        <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{formatCount(it.comments)}</span>
                        <button
                          onClick={(e) => handleShare(e, it)}
                          className="ms-auto inline-flex items-center gap-1 hover:text-white transition"
                          aria-label={isAr ? "مشاركة" : "Share"}
                        >
                          <Share2 className="h-3 w-3" />
                          {isAr ? "مشاركة" : "Share"}
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
