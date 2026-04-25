import { useEffect, useRef, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Loader2,
  Plus,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoPost {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  likes_count: number;
  comments_count: number;
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
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  async function load() {
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

    setVideos(
      posts.map((p) => ({
        ...(p as any),
        profile: profMap.get(p.user_id) as any,
        liked_by_me: likedSet.has(p.id),
      })) as VideoPost[],
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function onScroll() {
    const c = containerRef.current;
    if (!c) return;
    const idx = Math.round(c.scrollTop / c.clientHeight);
    if (idx !== activeIdx) setActiveIdx(idx);
  }

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
          ref={containerRef}
          onScroll={onScroll}
          className="h-[calc(100vh-200px)] overflow-y-auto snap-y snap-mandatory rounded-lg bg-black"
        >
          {videos.map((v, i) => (
            <VideoCard
              key={v.id}
              video={v}
              isActive={i === activeIdx}
              muted={muted}
              onLikeToggle={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VideoCard({
  video,
  isActive,
  muted,
  onLikeToggle,
}: {
  video: VideoPost;
  isActive: boolean;
  muted: boolean;
  onLikeToggle: () => void;
}) {
  const { user } = useAuth();
  const ref = useRef<HTMLVideoElement>(null);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isActive) el.play().catch(() => {});
    else {
      el.pause();
      el.currentTime = 0;
    }
  }, [isActive]);

  async function toggleLike() {
    if (!user || liking) return;
    setLiking(true);
    if (video.liked_by_me) {
      await supabase.from("likes").delete().eq("post_id", video.id).eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({ post_id: video.id, user_id: user.id });
    }
    setLiking(false);
    onLikeToggle();
  }

  const url = video.media_urls?.[0];
  const name = video.profile?.full_name || video.profile?.username || "user";

  return (
    <div className="snap-start h-full w-full relative flex items-center justify-center">
      {url && (
        <video
          ref={ref}
          src={url}
          muted={muted}
          loop
          playsInline
          className="max-h-full max-w-full object-contain"
          onClick={(e) => {
            const v = e.currentTarget;
            v.paused ? v.play() : v.pause();
          }}
        />
      )}
      {/* Overlay */}
      <div className="absolute bottom-4 left-4 right-16 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8 border border-white/40">
            <AvatarImage src={video.profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-black/50 text-white text-xs">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">@{video.profile?.username}</span>
        </div>
        {video.content && (
          <p className="text-sm bg-black/40 px-2 py-1 rounded backdrop-blur-sm line-clamp-3">
            {video.content}
          </p>
        )}
      </div>
      <div className="absolute bottom-4 right-3 flex flex-col items-center gap-4 text-white">
        <button
          onClick={toggleLike}
          className="flex flex-col items-center gap-1"
        >
          <Heart
            className={cn(
              "h-7 w-7 transition",
              video.liked_by_me ? "fill-red-500 text-red-500" : "text-white",
            )}
          />
          <span className="text-xs">{video.likes_count}</span>
        </button>
        <div className="flex flex-col items-center gap-1">
          <MessageCircle className="h-7 w-7" />
          <span className="text-xs">{video.comments_count}</span>
        </div>
      </div>
    </div>
  );
}

function UploadVideoDialog({ onUploaded }: { onUploaded: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !user) return;
    if (f.size > 100 * 1024 * 1024) {
      toast.error("الحجم الأقصى 100MB");
      return;
    }
    setUploading(true);
    try {
      const ext = f.name.split(".").pop() || "mp4";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("videos")
        .upload(path, f, { contentType: f.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
      const { error: insErr } = await supabase.from("posts").insert({
        user_id: user.id,
        type: "video",
        content: caption.trim() || null,
        media_urls: [pub.publicUrl],
      });
      if (insErr) throw insErr;
      toast.success("تم نشر الفيديو 🎬");
      setOpen(false);
      setCaption("");
      onUploaded();
    } catch (err: any) {
      toast.error(err?.message || "فشل الرفع");
    } finally {
      setUploading(false);
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
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" /> اختر فيديو (حتى 100MB)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
