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
  Eye,
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

export function VideoFeed({ feedType = "video", storageKey = "videos" }: { feedType?: "video" | "short" | Array<"video" | "short">; storageKey?: string } = {}) {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(`${storageKey}:activeId`);
  });
  const [commentsForId, setCommentsForId] = useState<string | null>(null);

  // Persist active video so user resumes on the same one when returning
  useEffect(() => {
    if (activeId) sessionStorage.setItem(`${storageKey}:activeId`, activeId);
  }, [activeId]);

  const load = useCallback(async () => {
    setLoading(true);
    const types = Array.isArray(feedType) ? feedType : [feedType];
    const query = supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    const { data: posts } = types.length > 1
      ? await query.in("type", types)
      : await query.eq("type", types[0]);
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
    setActiveId((prev) => {
      if (prev && list.some((v) => v.id === prev)) return prev;
      return list[0]?.id ?? null;
    });
    setLoading(false);
  }, [user, feedType]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, feedType]);

  // Optimistic local update for like (avoid full reload)
  const updateLocal = useCallback((id: string, patch: Partial<VideoPost>) => {
    setVideos((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  // Refs to each card for scroll-to-resume
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const didRestoreRef = useRef(false);

  // After videos load, scroll to the persisted active video (resume)
  useEffect(() => {
    if (loading || didRestoreRef.current || !activeId) return;
    const el = cardRefs.current.get(activeId);
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
      didRestoreRef.current = true;
    }
  }, [loading, activeId, videos]);

  // Index of active video for prefetching the next one
  const activeIdx = videos.findIndex((v) => v.id === activeId);
  const nextUrl =
    activeIdx >= 0 && activeIdx < videos.length - 1
      ? videos[activeIdx + 1]?.media_urls?.[0]
      : undefined;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-glow" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating header — overlays the video with glass + gradient title */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
        <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          Reels
        </h2>
        <div className="flex gap-2 pointer-events-auto">
          <UploadVideoDialog onUploaded={load} />
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>لا توجد فيديوهات بعد. كن أول من يرفع! 🎬</p>
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="h-full md:h-[calc(100vh-3.5rem)] overflow-y-auto snap-y snap-mandatory bg-black scroll-smooth"
        >
          {videos.map((v, i) => {
            const distance = activeIdx >= 0 ? Math.abs(i - activeIdx) : i;
            // active=auto, neighbors=metadata, far=none (lazy)
            const preload: "auto" | "metadata" | "none" =
              distance === 0 ? "auto" : distance === 1 ? "metadata" : "none";
            return (
              <VideoCard
                key={v.id}
                video={v}
                isActive={v.id === activeId}
                muted={muted}
                onToggleMuted={() => setMuted((m) => !m)}
                preload={preload}
                shouldRenderSrc={distance <= 2}
                registerRef={(el) => {
                  if (el) cardRefs.current.set(v.id, el);
                  else cardRefs.current.delete(v.id);
                }}
                onVisible={() => setActiveId(v.id)}
                onUpdateLocal={updateLocal}
                onOpenComments={() => setCommentsForId(v.id)}
              />
            );
          })}
        </div>
      )}

      {/* Prefetch the next video so it's instant when scrolled to */}
      {nextUrl && (
        <link rel="prefetch" as="video" href={nextUrl} key={nextUrl} />
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
  onToggleMuted,
  preload,
  shouldRenderSrc,
  registerRef,
  onVisible,
  onUpdateLocal,
  onOpenComments,
}: {
  video: VideoPost;
  isActive: boolean;
  muted: boolean;
  onToggleMuted: () => void;
  preload: "auto" | "metadata" | "none";
  shouldRenderSrc: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
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
  const [progress, setProgress] = useState(0);
  const [likeBurst, setLikeBurst] = useState(0);
  const lastTapRef = useRef(0);

  // IntersectionObserver: detect when this card is the active one
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    registerRef(el);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.intersectionRatio > 0.6) onVisible();
        });
      },
      { threshold: [0, 0.6, 1] },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      registerRef(null);
    };
  }, [onVisible, registerRef]);

  // Persist playback position so we resume at the same spot on return
  const positionKey = `videos:pos:${video.id}`;

  // Restore position when the <video> element mounts/loads
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const saved = sessionStorage.getItem(positionKey);
    if (saved) {
      const t = parseFloat(saved);
      if (!isNaN(t) && t > 0) {
        const onLoaded = () => {
          try {
            el.currentTime = Math.min(t, (el.duration || t) - 0.1);
          } catch {}
          el.removeEventListener("loadedmetadata", onLoaded);
        };
        if (el.readyState >= 1) onLoaded();
        else el.addEventListener("loadedmetadata", onLoaded);
      }
    }
  }, [positionKey, video.media_urls]);

  // Save current position periodically while playing + update progress
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onTime = () => {
      if (el.currentTime > 0) {
        sessionStorage.setItem(positionKey, String(el.currentTime));
      }
      if (el.duration > 0) {
        setProgress((el.currentTime / el.duration) * 100);
      }
    };
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [positionKey]);

  // Play/pause based on isActive (DON'T reset currentTime — keep resume position)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isActive && !paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
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
    if (!wasLiked) setLikeBurst((n) => n + 1);
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

  // Detect external video platforms (YouTube / TikTok / Instagram)
  const ytMatch = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const ytId = ytMatch?.[1];
  const tiktokMatch = url?.match(/tiktok\.com\/.*\/video\/(\d+)/);
  const tiktokId = tiktokMatch?.[1];
  const igMatch = url?.match(/instagram\.com\/(?:reel|p|tv)\/([\w-]+)/);
  const igId = igMatch?.[1];
  const isExternal = !!(ytId || tiktokId || igId);

  const platformLabel = ytId ? "YouTube" : tiktokId ? "TikTok" : igId ? "Instagram" : null;

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  };

  return (
    <div
      ref={containerRef}
      className="snap-start h-full w-full relative flex items-center justify-center"
    >
      {/* Ambient glow halo behind active video — gives depth */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-1/4 left-1/2 -translate-x-1/2 h-[60%] w-[80%] rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, oklch(0.78 0.18 220 / 0.6), transparent 70%)" }}
          />
          <div
            className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 h-[60%] w-[80%] rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, oklch(0.65 0.25 295 / 0.6), transparent 70%)" }}
          />
        </div>
      )}

      {/* Video frame with holographic border */}
      <div className="holo-frame relative w-full h-full md:w-auto md:h-full md:max-w-[440px] md:rounded-3xl overflow-hidden flex items-center justify-center bg-black">
        {url && shouldRenderSrc ? (
          isExternal ? (
            <div className="h-full w-full flex items-center justify-center bg-black">
              {ytId && (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=${isActive && !paused ? 1 : 0}&mute=${muted ? 1 : 0}&loop=1&playlist=${ytId}&controls=1&modestbranding=1&rel=0&playsinline=1`}
                  title="YouTube video"
                  className="w-full h-full max-h-full max-w-full aspect-[9/16] md:aspect-video"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
              {tiktokId && (
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
                  title="TikTok video"
                  className="w-full h-full max-h-full max-w-full aspect-[9/16]"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}
              {igId && (
                <iframe
                  src={`https://www.instagram.com/p/${igId}/embed`}
                  title="Instagram video"
                  className="w-full h-full max-h-full max-w-full aspect-[9/16]"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          ) : (
            <video
              ref={ref}
              src={url}
              muted={muted}
              loop
              playsInline
              preload={preload}
              className="max-h-full max-w-full object-contain"
              onClick={handleTap}
            />
          )
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/40 text-sm">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {/* Vignette + scan lines (skip for iframes — they have their own UI) */}
        {!isExternal && (
          <>
            <div className="holo-vignette" />
            <div className="scan-overlay" />
          </>
        )}

        {/* Platform badge (top-left) */}
        {platformLabel && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-white username-chip flex items-center gap-1.5">
            <span className="live-dot" />
            {platformLabel}
          </div>
        )}

        {/* Pause indicator with animated ring */}
        {paused && isActive && !isExternal && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative h-20 w-20 rounded-full action-glass flex items-center justify-center">
              <Play className="h-10 w-10 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" fill="white" />
            </div>
          </div>
        )}

        {/* Double-tap heart burst */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart
              className="h-32 w-32 text-pink-glow fill-pink-glow drop-shadow-[0_0_24px_rgba(236,72,153,0.9)]"
              style={{ animation: "scale-in 0.25s ease-out, fade-out 0.6s ease-in 0.3s forwards" }}
            />
          </div>
        )}

        {/* Bottom-left meta */}
        <div className="absolute bottom-4 left-4 right-20 text-white z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-cyan-glow/60 shadow-glow-cyan">
                <AvatarImage src={video.profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-black/50 text-white text-xs">
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight">@{video.profile?.username}</span>
              {video.profile?.full_name && (
                <span className="text-[10px] text-white/60 leading-tight">{video.profile.full_name}</span>
              )}
            </div>
          </div>
          {video.content && (
            <p className="text-sm username-chip px-3 py-1.5 rounded-xl line-clamp-3 leading-relaxed">
              {video.content}
            </p>
          )}
        </div>

        {/* Right action rail — futuristic */}
        <div className="absolute bottom-6 right-3 flex flex-col items-center gap-4 text-white z-10">
          <ActionButton
            onClick={toggleLike}
            disabled={liking}
            active={video.liked_by_me}
            label="إعجاب"
            count={video.likes_count}
            burstKey={likeBurst}
          >
            <Heart className={cn("h-6 w-6 transition-all", video.liked_by_me && "fill-pink-glow text-pink-glow scale-110")} />
          </ActionButton>

          <ActionButton onClick={onOpenComments} label="تعليقات" count={video.comments_count}>
            <MessageCircle className="h-6 w-6" />
          </ActionButton>

          <ActionButton onClick={share} label="مشاركة">
            <Share2 className="h-6 w-6" />
          </ActionButton>

          <ActionButton onClick={onToggleMuted} label={muted ? "تشغيل الصوت" : "كتم"}>
            {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </ActionButton>

          <ActionButton label="مشاهدات" count={video.views_count || 0} dim>
            <Eye className="h-5 w-5" />
          </ActionButton>

          <button
            onClick={() => setPaused((p) => !p)}
            className="md:hidden h-10 w-10 rounded-full action-glass flex items-center justify-center active:scale-90 transition"
            aria-label={paused ? "تشغيل" : "إيقاف"}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>

        {/* Bottom progress bar (only for native video) */}
        {!isExternal && url && (
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10 z-10">
            <div
              className="h-full bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow transition-[width] duration-150 shadow-glow-cyan"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  active,
  label,
  count,
  dim,
  burstKey,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
  count?: number;
  dim?: boolean;
  burstKey?: number;
}) {
  const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  };
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex flex-col items-center gap-1 active:scale-90 transition",
        dim && "opacity-80",
      )}
      aria-label={label}
    >
      <div
        className={cn(
          "relative h-11 w-11 rounded-full flex items-center justify-center transition",
          active ? "action-glass-active" : "action-glass group-hover:scale-105",
        )}
      >
        {children}
        {/* Burst ring on activation */}
        {active && burstKey ? (
          <span
            key={burstKey}
            className="ring-burst text-pink-glow"
            style={{ pointerEvents: "none" }}
          />
        ) : null}
      </div>
      {count !== undefined && (
        <span className="text-[11px] font-bold tracking-tight tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {formatCount(count)}
        </span>
      )}
    </Comp>
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
