import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Loader2,
  Plus,
  Upload,
  Volume2,
  VolumeX,
  Share2,
  Play,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CommentsSection } from "@/components/feed/CommentsSection";

interface VideoPost {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  liked_by_me?: boolean;
  profile?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function VideoFeed() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("videos:activeId");
  });
  const [commentsForId, setCommentsForId] = useState<string | null>(null);

  // Persist active video so user resumes on the same one when returning
  useEffect(() => {
    if (activeId) sessionStorage.setItem("videos:activeId", activeId);
  }, [activeId]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .eq("type", "video")
      .order("created_at", { ascending: false })
      .limit(30);
    if (!posts) {
      setVideos([]);
      setLoading(false);
      return;
    }
    const userIds = Array.from(new Set(posts.map((p) => p.user_id)));
    const { data: profs } = userIds.length
      ? await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", userIds)
      : { data: [] };
    const profMap = new Map((profs || []).map((p) => [p.id, p]));

    let likedSet = new Set<string>();
    if (user) {
      const { data: likes } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", posts.map((p) => p.id));
      likedSet = new Set((likes || []).map((l) => l.post_id));
    }

    const list = posts.map((p) => ({
      ...(p as any),
      profile: profMap.get(p.user_id) as any,
      liked_by_me: likedSet.has(p.id),
    })) as VideoPost[];
    setVideos(list);
    if (!activeId && list[0]) setActiveId(list[0].id);
    setLoading(false);
  }, [user, activeId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Optimistic local update for like (avoid full reload)
  const updateLocal = useCallback((id: string, patch: Partial<VideoPost>) => {
    setVideos((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-glow" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">الفيديوهات</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMuted((m) => !m)}
            className="text-cyan-glow"
            aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <UploadVideoDialog onUploaded={load} />
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>لا توجد فيديوهات بعد. كن أول من يرفع! 🎬</p>
        </div>
      ) : (
        <div
          className="h-[calc(100vh-200px)] overflow-y-auto snap-y snap-mandatory rounded-lg bg-black scroll-smooth"
        >
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              isActive={v.id === activeId}
              muted={muted}
              onVisible={() => setActiveId(v.id)}
              onUpdateLocal={updateLocal}
              onOpenComments={() => setCommentsForId(v.id)}
            />
          ))}
        </div>
      )}

      <Sheet open={!!commentsForId} onOpenChange={(o) => !o && setCommentsForId(null)}>
        <SheetContent side="bottom" className="bg-ice-card border-ice-border h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>التعليقات</SheetTitle>
          </SheetHeader>
          {commentsForId && (
            <div className="mt-4">
              <CommentsSection
                postId={commentsForId}
                onChange={() => {
                  // bump local comment count
                  setVideos((vs) =>
                    vs.map((v) =>
                      v.id === commentsForId
                        ? { ...v, comments_count: v.comments_count + 0 }
                        : v,
                    ),
                  );
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function VideoCard({
  video,
  isActive,
  muted,
  onVisible,
  onUpdateLocal,
  onOpenComments,
}: {
  video: VideoPost;
  isActive: boolean;
  muted: boolean;
  onVisible: () => void;
  onUpdateLocal: (id: string, patch: Partial<VideoPost>) => void;
  onOpenComments: () => void;
}) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const [liking, setLiking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const lastTapRef = useRef(0);

  // IntersectionObserver: detect when this card is the active one
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.intersectionRatio > 0.6) onVisible();
        });
      },
      { threshold: [0, 0.6, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisible]);

  // Play/pause based on isActive
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isActive && !paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
      if (!isActive) el.currentTime = 0;
    }
  }, [isActive, paused]);

  // Count a view once when becomes active
  useEffect(() => {
    if (!isActive || viewCounted) return;
    setViewCounted(true);
    supabase
      .from("posts")
      .update({ views_count: (video.views_count || 0) + 1 })
      .eq("id", video.id)
      .then(() => {});
    onUpdateLocal(video.id, { views_count: (video.views_count || 0) + 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  async function toggleLike() {
    if (!user || liking) return;
    setLiking(true);
    const wasLiked = video.liked_by_me;
    // optimistic
    onUpdateLocal(video.id, {
      liked_by_me: !wasLiked,
      likes_count: video.likes_count + (wasLiked ? -1 : 1),
    });
    try {
      if (wasLiked) {
        await supabase.from("likes").delete().eq("post_id", video.id).eq("user_id", user.id);
      } else {
        await supabase.from("likes").insert({ post_id: video.id, user_id: user.id });
      }
    } catch {
      // revert
      onUpdateLocal(video.id, {
        liked_by_me: wasLiked,
        likes_count: video.likes_count,
      });
    } finally {
      setLiking(false);
    }
  }

  function handleTap() {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // double tap → like
      if (!video.liked_by_me) toggleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // single tap → toggle pause after delay
      setTimeout(() => {
        if (lastTapRef.current && Date.now() - lastTapRef.current >= 280) {
          setPaused((p) => !p);
          lastTapRef.current = 0;
        }
      }, 300);
    }
  }

  async function share() {
    const shareUrl = `${window.location.origin}/videos?v=${video.id}`;
    const shareData = {
      title: `فيديو من @${video.profile?.username || "user"}`,
      text: video.content || "شاهد هذا الفيديو",
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("تم نسخ الرابط 🔗");
      }
    } catch {
      // user cancelled
    }
  }

  const url = video.media_urls?.[0];
  const name = video.profile?.full_name || video.profile?.username || "user";

  return (
    <div
      ref={containerRef}
      className="snap-start h-full w-full relative flex items-center justify-center"
    >
      {url && (
        <video
          ref={ref}
          src={url}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="max-h-full max-w-full object-contain"
          onClick={handleTap}
        />
      )}

      {/* Pause indicator */}
      {paused && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-4 backdrop-blur-sm">
            <Play className="h-12 w-12 text-white" fill="white" />
          </div>
        </div>
      )}

      {/* Double-tap heart burst */}
      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart className="h-24 w-24 text-red-500 fill-red-500 animate-ping" />
        </div>
      )}

      {/* Bottom-left meta */}
      <div className="absolute bottom-4 left-4 right-20 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-9 w-9 border border-white/40">
            <AvatarImage src={video.profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-black/50 text-white text-xs">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">@{video.profile?.username}</span>
        </div>
        {video.content && (
          <p className="text-sm bg-black/40 px-2 py-1 rounded backdrop-blur-sm line-clamp-3">
            {video.content}
          </p>
        )}
        <p className="text-xs text-white/70 mt-1">
          👁 {video.views_count || 0} مشاهدة
        </p>
      </div>

      {/* Right action rail */}
      <div className="absolute bottom-6 right-3 flex flex-col items-center gap-5 text-white">
        <button
          onClick={toggleLike}
          disabled={liking}
          className="flex flex-col items-center gap-1 active:scale-90 transition"
          aria-label="إعجاب"
        >
          <div className="bg-black/40 rounded-full p-2 backdrop-blur-sm">
            <Heart
              className={cn(
                "h-6 w-6 transition",
                video.liked_by_me ? "fill-red-500 text-red-500" : "text-white",
              )}
            />
          </div>
          <span className="text-xs font-medium">{video.likes_count}</span>
        </button>

        <button
          onClick={onOpenComments}
          className="flex flex-col items-center gap-1 active:scale-90 transition"
          aria-label="تعليقات"
        >
          <div className="bg-black/40 rounded-full p-2 backdrop-blur-sm">
            <MessageCircle className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium">{video.comments_count}</span>
        </button>

        <button
          onClick={share}
          className="flex flex-col items-center gap-1 active:scale-90 transition"
          aria-label="مشاركة"
        >
          <div className="bg-black/40 rounded-full p-2 backdrop-blur-sm">
            <Share2 className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium">شارك</span>
        </button>

        <button
          onClick={() => setPaused((p) => !p)}
          className="flex flex-col items-center gap-1 active:scale-90 transition md:hidden"
          aria-label={paused ? "تشغيل" : "إيقاف"}
        >
          <div className="bg-black/40 rounded-full p-2 backdrop-blur-sm">
            {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </div>
        </button>
      </div>
    </div>
  );
}

function UploadVideoDialog({ onUploaded }: { onUploaded: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !user) return;
    if (!f.type.startsWith("video/")) {
      toast.error("الملف يجب أن يكون فيديو");
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      toast.error("الحجم الأقصى 100MB");
      return;
    }
    setUploading(true);
    setProgress(10);
    try {
      const ext = f.name.split(".").pop() || "mp4";
      const path = `${user.id}/${Date.now()}.${ext}`;
      setProgress(30);
      const { error: upErr } = await supabase.storage
        .from("videos")
        .upload(path, f, { contentType: f.type });
      if (upErr) throw upErr;
      setProgress(80);
      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
      const { error: insErr } = await supabase.from("posts").insert({
        user_id: user.id,
        type: "video",
        content: caption.trim() || null,
        media_urls: [pub.publicUrl],
      });
      if (insErr) throw insErr;
      setProgress(100);
      toast.success("تم نشر الفيديو 🎬");
      setOpen(false);
      setCaption("");
      onUploaded();
    } catch (err: any) {
      toast.error(err?.message || "فشل الرفع");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40">
          <Plus className="h-4 w-4 mr-1" /> فيديو
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-ice-card border-ice-border">
        <DialogHeader>
          <DialogTitle>ارفع فيديو جديداً</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="وصف الفيديو..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={300}
            className="bg-ice-bg border-ice-border"
          />
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            onChange={onPick}
            className="hidden"
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري الرفع... {progress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" /> اختر فيديو (حتى 100MB)
              </>
            )}
          </Button>
          {uploading && (
            <div className="h-1.5 bg-ice-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-glow transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            💡 نصيحة: استخدم فيديو عمودي (9:16) للحصول على أفضل تجربة.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
