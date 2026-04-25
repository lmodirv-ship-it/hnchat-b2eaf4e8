import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

  const isMine = user?.id === post.user_id;

  async function toggleLike() {
    if (!user || liking) return;
    setLiking(true);

    const wasLiked = optimisticLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticCount((n) => n + (wasLiked ? -1 : 1));

    if (wasLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);
      if (error) {
        setOptimisticLiked(true);
        setOptimisticCount((n) => n + 1);
        toast.error(error.message);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ post_id: post.id, user_id: user.id });
      if (error && !error.message.includes("duplicate")) {
        setOptimisticLiked(false);
        setOptimisticCount((n) => n - 1);
        toast.error(error.message);
      }
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
    const url = `${window.location.origin}/feed#${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ الرابط");
  }

  return (
    <Card
      id={post.id}
      className="p-4 bg-ice-card border-ice-border backdrop-blur-xl hover:shadow-[0_0_24px_oklch(0.78_0.18_220/0.15)] transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <Link
          to="/profile"
          className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center text-sm font-bold text-primary-foreground overflow-hidden shrink-0"
        >
          {post.profile?.avatar_url ? (
            <img src={post.profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            post.profile?.username?.[0]?.toUpperCase() ?? "?"
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate">
              {post.profile?.full_name ?? post.profile?.username ?? "User"}
            </span>
            {post.profile?.is_verified && <span className="text-cyan-glow text-xs">✓</span>}
          </div>
          <div className="text-xs text-muted-foreground">
            @{post.profile?.username} ·{" "}
            {formatDistanceToNow(new Date(post.created_at), { locale: ar, addSuffix: true })}
          </div>
        </div>
        {isMine && (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-ice-card transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-ice-border">
              <DropdownMenuItem
                onClick={deletePost}
                disabled={deleting}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <Trash2 className="h-4 w-4 me-2" />
                )}
                حذف المنشور
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {post.content && (
        <p className="text-sm whitespace-pre-wrap break-words mb-3 leading-relaxed">
          {post.content}
        </p>
      )}

      {post.media_urls && post.media_urls.length > 0 && (
        <div
          className={cn(
            "grid gap-2 mb-3 rounded-xl overflow-hidden",
            post.media_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          {post.media_urls.slice(0, 4).map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="w-full h-full max-h-96 object-cover rounded-lg border border-ice-border"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-muted-foreground -mx-1">
        <button
          onClick={toggleLike}
          disabled={liking}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-pink-glow/10 transition-colors",
            optimisticLiked && "text-pink-glow"
          )}
        >
          <Heart className={cn("h-4 w-4", optimisticLiked && "fill-current")} />
          <span className="font-medium">{optimisticCount}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-cyan-glow/10 transition-colors",
            showComments && "text-cyan-glow"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="font-medium">{post.comments_count}</span>
        </button>
        <button
          onClick={share}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-violet-glow/10 transition-colors hover:text-violet-glow ms-auto"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {showComments && <CommentsSection postId={post.id} onChange={onChange} />}
    </Card>
  );
}
