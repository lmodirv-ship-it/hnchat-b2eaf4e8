import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentsSection } from "./CommentsSection";
import { SocialShareMenu } from "./SocialShareMenu";
import { cn } from "@/lib/utils";

function getPostVideoUrl(urls: string[] | null | undefined): string | null {
  if (!urls) return null;
  for (const u of urls) {
    if (/(?:youtube\.com|youtu\.be)/.test(u)) return u;
    if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(u)) return u;
  }
  return null;
}

export interface FeedPost {
  id: string;
  content: string | null;
  media_urls: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  liked_by_me?: boolean;
  profile?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_verified?: boolean;
  } | null;
}

export function PostCard({ post, onChange }: { post: FeedPost; onChange: () => void }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(post.liked_by_me ?? false);
  const [optimisticCount, setOptimisticCount] = useState(post.likes_count);
  const [deleting, setDeleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isMine = user?.id === post.user_id;

  // Subtle parallax on mouse move
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(800px) rotateY(${x * 1.5}deg) rotateX(${-y * 1.5}deg)`;
  }

  function handleMouseLeave() {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(800px) rotateY(0) rotateX(0)";
    }
  }

  async function toggleLike() {
    if (!user || liking) return;
    setLiking(true);
    const wasLiked = optimisticLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticCount((n) => n + (wasLiked ? -1 : 1));

    if (wasLiked) {
      const { error } = await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      if (error) { setOptimisticLiked(true); setOptimisticCount((n) => n + 1); toast.error(error.message); }
    } else {
      const { error } = await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
      if (error && !error.message.includes("duplicate")) { setOptimisticLiked(false); setOptimisticCount((n) => n - 1); toast.error(error.message); }
    }
    setLiking(false);
  }

  async function deletePost() {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;
    setDeleting(true);
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    setDeleting(false);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    onChange();
  }

  function share() {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ الرابط");
  }

  return (
    <div
      ref={cardRef}
      id={post.id}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl transition-all duration-500 ease-out will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Ambient glow on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[oklch(0.78_0.18_220/0)] to-[oklch(0.65_0.25_295/0)] group-hover:from-[oklch(0.78_0.18_220/0.08)] group-hover:to-[oklch(0.65_0.25_295/0.06)] transition-all duration-700 -z-10 blur-sm" />

      <div className="relative p-4 sm:p-5 bg-[oklch(0.06_0.015_260/0.6)] border border-[oklch(1_0_0/0.05)] group-hover:border-[oklch(1_0_0/0.1)] backdrop-blur-2xl rounded-2xl transition-all duration-500">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Link
            to="/profile"
            className="relative h-10 w-10 rounded-full bg-gradient-to-br from-[oklch(0.78_0.18_220)] to-[oklch(0.65_0.25_295)] flex items-center justify-center text-sm font-bold text-[oklch(0.04_0.01_280)] overflow-hidden shrink-0 active:scale-95 transition-all ring-2 ring-[oklch(0.06_0.015_260)] group-hover:ring-[oklch(0.78_0.18_220/0.3)] group-hover:shadow-[0_0_16px_oklch(0.78_0.18_220/0.2)]"
          >
            {post.profile?.avatar_url ? (
              <img src={post.profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              post.profile?.username?.[0]?.toUpperCase() ?? "?"
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-[oklch(0.9_0.03_250)] truncate">
                {post.profile?.full_name ?? post.profile?.username ?? "User"}
              </span>
              {post.profile?.is_verified && (
                <span className="text-[oklch(0.78_0.18_220)] text-[10px] bg-[oklch(0.78_0.18_220/0.1)] px-1 py-0.5 rounded-full font-bold">✓</span>
              )}
            </div>
            <div className="text-[10px] text-[oklch(0.45_0.03_250)]">
              @{post.profile?.username} · {formatDistanceToNow(new Date(post.created_at), { locale: ar, addSuffix: true })}
            </div>
          </div>
          {isMine && (
            <DropdownMenu>
              <DropdownMenuTrigger className="text-[oklch(0.4_0.03_250)] hover:text-[oklch(0.7_0.03_250)] p-1.5 rounded-lg hover:bg-[oklch(1_0_0/0.04)] active:scale-95 transition-all">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[oklch(0.06_0.02_260/0.95)] backdrop-blur-2xl border-[oklch(1_0_0/0.08)]">
                <DropdownMenuItem onClick={deletePost} disabled={deleting} className="text-destructive focus:text-destructive cursor-pointer">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Trash2 className="h-4 w-4 me-2" />}
                  حذف المنشور
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm whitespace-pre-wrap break-words mb-3 leading-relaxed text-[oklch(0.85_0.02_250)]">
            {post.content}
          </p>
        )}

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (() => {
          const ytId = (() => {
            for (const u of post.media_urls!) {
              const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
              if (m) return m[1];
            }
            return null;
          })();
          if (ytId) {
            return (
              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden mb-3 border border-[oklch(1_0_0/0.06)]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&playsinline=1`}
                  title={post.content || "Video"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 h-12 w-44 bg-black pointer-events-none z-10" aria-hidden />
                <div className="absolute bottom-0 right-0 h-12 w-32 bg-black pointer-events-none z-10" aria-hidden />
              </div>
            );
          }
          return (
            <div className={cn(
              "grid gap-1.5 mb-3 rounded-xl overflow-hidden",
              post.media_urls!.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
              {post.media_urls!.slice(0, 4).map((url, i) => (
                <img key={i} src={url} alt="" className="w-full h-full max-h-80 object-cover rounded-lg border border-[oklch(1_0_0/0.04)]" />
              ))}
            </div>
          );
        })()}

        {/* Actions */}
        <div className="flex items-center gap-1 text-xs text-[oklch(0.45_0.03_250)] -mx-1 pt-2.5 border-t border-[oklch(1_0_0/0.04)]">
          <button
            onClick={toggleLike}
            disabled={liking}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 active:scale-90",
              optimisticLiked
                ? "text-[oklch(0.72_0.22_340)] bg-[oklch(0.72_0.22_340/0.08)]"
                : "hover:bg-[oklch(0.72_0.22_340/0.06)] hover:text-[oklch(0.72_0.22_340)]"
            )}
          >
            <Heart className={cn(
              "h-[18px] w-[18px] transition-all duration-300",
              optimisticLiked && "fill-current scale-110"
            )} />
            <span className="font-medium tabular-nums">{optimisticCount}</span>
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 active:scale-90",
              showComments
                ? "text-[oklch(0.78_0.18_220)] bg-[oklch(0.78_0.18_220/0.08)]"
                : "hover:bg-[oklch(0.78_0.18_220/0.06)] hover:text-[oklch(0.78_0.18_220)]"
            )}
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="font-medium tabular-nums">{post.comments_count}</span>
          </button>
          {(() => {
            const videoUrl = getPostVideoUrl(post.media_urls);
            if (videoUrl) {
              return <div className="ms-auto"><SocialShareMenu videoUrl={videoUrl} caption={post.content} /></div>;
            }
            return (
              <button
                onClick={share}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-[oklch(0.65_0.25_295/0.06)] hover:text-[oklch(0.65_0.25_295)] active:scale-90 transition-all duration-300 ms-auto"
              >
                <Share2 className="h-[18px] w-[18px]" />
              </button>
            );
          })()}
        </div>

        {showComments && <CommentsSection postId={post.id} onChange={onChange} />}
      </div>
    </div>
  );
}
