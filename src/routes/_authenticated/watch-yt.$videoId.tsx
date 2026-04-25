import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentsSection } from "@/components/feed/CommentsSection";
import {
  ArrowLeft,
  Plus,
  Check,
  Loader2,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Bookmark,
  BookmarkCheck,
  Send,
} from "lucide-react";
import { getYoutubeVideoMeta } from "@/utils/youtube.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/watch-yt/$videoId")({
  component: WatchYtPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-destructive">خطأ: {error.message}</div>
  ),
});

type Stats = {
  likes_count: number;
  comments_count: number;
  views_count: number;
  liked_by_me: boolean;
  bookmarked: boolean;
};

function WatchYtPage() {
  const { videoId } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [postId, setPostId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [stats, setStats] = useState<Stats>({
    likes_count: 0,
    comments_count: 0,
    views_count: 0,
    liked_by_me: false,
    bookmarked: false,
  });
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const { data: meta, isLoading } = useQuery({
    queryKey: ["yt-meta", videoId],
    queryFn: () => getYoutubeVideoMeta({ data: { videoId } }),
  });

  // Find the post for this video (if added)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const { data: existing } = await supabase
        .from("posts")
        .select("id, likes_count, comments_count, views_count")
        .contains("media_urls", [ytUrl])
        .maybeSingle();
      if (cancelled || !existing) return;
      setPostId(existing.id);
      setStats((s) => ({
        ...s,
        likes_count: existing.likes_count ?? 0,
        comments_count: existing.comments_count ?? 0,
        views_count: (existing.views_count ?? 0) + 1,
      }));

      // Increment view count (best-effort, ignore errors)
      supabase
        .from("posts")
        .update({ views_count: (existing.views_count ?? 0) + 1 })
        .eq("id", existing.id)
        .then(() => undefined);

      if (user) {
        const [{ data: liked }, { data: bm }] = await Promise.all([
          supabase
            .from("likes")
            .select("id")
            .eq("post_id", existing.id)
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("user_bookmarks")
            .select("id")
            .eq("item_id", existing.id)
            .eq("user_id", user.id)
            .eq("item_type", "post")
            .maybeSingle(),
        ]);
        if (cancelled) return;
        setStats((s) => ({
          ...s,
          liked_by_me: !!liked,
          bookmarked: !!bm,
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, videoId]);

  const addToSite = async () => {
    if (!user || !meta) return;
    setAdding(true);
    try {
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const { data: created, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          type: "video" as any,
          content: meta.title,
          media_urls: [ytUrl],
        })
        .select("id")
        .single();
      if (error) throw error;
      setPostId(created.id);
      toast.success("تمت إضافة الفيديو إلى الموقع");
    } catch (e: any) {
      toast.error(e.message || "تعذّرت الإضافة");
    } finally {
      setAdding(false);
    }
  };

  const publishToFeed = async () => {
    if (!user || !meta || publishing) return;
    setPublishing(true);
    try {
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      let id = postId;
      if (id) {
        // Re-publish: bump updated_at so it surfaces in the feed again
        const { error } = await supabase
          .from("posts")
          .update({ updated_at: new Date().toISOString(), content: meta.title })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase
          .from("posts")
          .insert({
            user_id: user.id,
            type: "video" as any,
            content: meta.title,
            media_urls: [ytUrl],
          })
          .select("id")
          .single();
        if (error) throw error;
        id = created.id;
        setPostId(id);
      }
      toast.success("تم النشر في الخلاصة 🎉", {
        description: meta.title,
        action: {
          label: "عرض",
          onClick: () => router.navigate({ to: "/feed" }),
        },
      });
    } catch (e: any) {
      toast.error(e.message || "تعذّر النشر");
    } finally {
      setPublishing(false);
    }
  };

  const toggleLike = async () => {
    if (!user || !postId || liking) return;
    setLiking(true);
    const wasLiked = stats.liked_by_me;
    setStats((s) => ({
      ...s,
      liked_by_me: !wasLiked,
      likes_count: s.likes_count + (wasLiked ? -1 : 1),
    }));
    try {
      if (wasLiked) {
        await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error && !error.message.includes("duplicate")) throw error;
      }
    } catch (e: any) {
      // revert
      setStats((s) => ({
        ...s,
        liked_by_me: wasLiked,
        likes_count: s.likes_count + (wasLiked ? 1 : -1),
      }));
      toast.error(e.message || "خطأ");
    } finally {
      setLiking(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user || !postId || bookmarking) return;
    setBookmarking(true);
    const wasBm = stats.bookmarked;
    setStats((s) => ({ ...s, bookmarked: !wasBm }));
    try {
      if (wasBm) {
        await supabase
          .from("user_bookmarks")
          .delete()
          .eq("item_id", postId)
          .eq("user_id", user.id)
          .eq("item_type", "post");
        toast.success("أُزيل من المحفوظات");
      } else {
        const { error } = await supabase.from("user_bookmarks").insert({
          item_id: postId,
          user_id: user.id,
          item_type: "post",
        });
        if (error) throw error;
        toast.success("تم الحفظ");
      }
    } catch (e: any) {
      setStats((s) => ({ ...s, bookmarked: wasBm }));
      toast.error(e.message || "خطأ");
    } finally {
      setBookmarking(false);
    }
  };

  const share = async () => {
    const shareUrl = `${window.location.origin}/watch-yt/${videoId}`;
    const shareData = {
      title: meta?.title || "Video",
      text: meta?.title || "",
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("تم نسخ الرابط");
      }
    } catch {
      // user cancelled
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-5xl space-y-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    );
  }

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => router.history.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 ml-1" /> رجوع
      </Button>

      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden mb-4">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={meta?.title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold mb-1">{meta?.title || "Video"}</h1>
          {meta?.author && (
            <p className="text-sm text-muted-foreground">{meta.author}</p>
          )}
          {postId && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {formatCount(stats.views_count)} مشاهدة
              </span>
              <span>·</span>
              <span>{formatCount(stats.likes_count)} إعجاب</span>
              <span>·</span>
              <span>{formatCount(stats.comments_count)} تعليق</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {postId ? (
            <Button size="sm" variant="secondary" disabled className="gap-1">
              <Check className="h-4 w-4" /> مُضاف
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={addToSite}
              disabled={adding || !user || !meta}
              className="gap-1"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              إضافة إلى الموقع
            </Button>
          )}
        </div>
      </div>

      {/* Action bar */}
      {postId ? (
        <Card className="p-2 mb-4 bg-ice-card border-ice-border flex items-center gap-1 flex-wrap">
          <button
            onClick={toggleLike}
            disabled={liking || !user}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-pink-glow/10 transition-colors text-sm",
              stats.liked_by_me && "text-pink-glow"
            )}
          >
            <Heart className={cn("h-4 w-4", stats.liked_by_me && "fill-current")} />
            <span className="font-medium">{formatCount(stats.likes_count)}</span>
            <span className="hidden sm:inline">إعجاب</span>
          </button>

          <button
            onClick={() =>
              document
                .getElementById("yt-comments")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-cyan-glow/10 transition-colors text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">{formatCount(stats.comments_count)}</span>
            <span className="hidden sm:inline">تعليق</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span className="font-medium">{formatCount(stats.views_count)}</span>
            <span className="hidden sm:inline">مشاهدة</span>
          </div>

          <button
            onClick={toggleBookmark}
            disabled={bookmarking || !user}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-violet-glow/10 transition-colors text-sm ms-auto",
              stats.bookmarked && "text-violet-glow"
            )}
          >
            {stats.bookmarked ? (
              <BookmarkCheck className="h-4 w-4 fill-current" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">حفظ</span>
          </button>

          <button
            onClick={share}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-cyan-glow/10 transition-colors text-sm"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">مشاركة</span>
          </button>
        </Card>
      ) : (
        <Card className="p-4 mb-4 bg-muted/40">
          <p className="text-sm text-muted-foreground">
            أضِف هذا الفيديو إلى الموقع لتفعيل الإعجابات والتعليقات والإحصائيات.
          </p>
        </Card>
      )}

      <h2 id="yt-comments" className="font-semibold mb-3 scroll-mt-4">
        التعليقات
      </h2>
      {postId ? (
        <CommentsSection
          postId={postId}
          onChange={() =>
            setStats((s) => ({ ...s, comments_count: s.comments_count }))
          }
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          أضِف الفيديو إلى الموقع لفتح التعليقات.
        </p>
      )}
    </div>
  );
}
