import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";

export const Route = createFileRoute("/_authenticated/feed")({
  component: FeedPage,
});

function FeedPage() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);

  const { data: posts, refetch, isLoading } = useQuery({
    queryKey: ["feed-posts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, media_urls, likes_count, comments_count, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      const userIds = [...new Set((data ?? []).map((p) => p.user_id))];
      if (userIds.length === 0) return [] as FeedPost[];

      const [profsRes, likesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, is_verified")
          .in("id", userIds),
        user
          ? supabase
              .from("likes")
              .select("post_id")
              .eq("user_id", user.id)
              .in("post_id", (data ?? []).map((p) => p.id))
          : Promise.resolve({ data: [] as { post_id: string }[] }),
      ]);

      const profMap = new Map((profsRes.data ?? []).map((p) => [p.id, p]));
      const likedSet = new Set((likesRes.data ?? []).map((l) => l.post_id));

      return (data ?? []).map((p) => ({
        ...p,
        profile: profMap.get(p.user_id) ?? null,
        liked_by_me: likedSet.has(p.id),
      })) as FeedPost[];
    },
  });

  // Realtime: listen for new posts from others
  useEffect(() => {
    const channel = supabase
      .channel("feed-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const newPost = payload.new as { user_id: string } | null;
          if (newPost && newPost.user_id !== user?.id) {
            setNewPostsCount((n) => n + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  async function handlePost() {
    if (!content.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase
      .from("posts")
      .insert({ user_id: user.id, content: content.trim(), type: "post" });
    setPosting(false);
    if (error) return toast.error(error.message);
    setContent("");
    toast.success("تم النشر بنجاح ✨");
    refetch();
  }

  function loadNewPosts() {
    setNewPostsCount(0);
    refetch();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <PageShell title="التغذية" subtitle="اكتشف ما يحدث في عالمك الآن">
      {/* Composer */}
      <Card className="p-4 mb-6 bg-ice-card border-ice-border backdrop-blur-xl">
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <Textarea
              placeholder="ماذا يدور في ذهنك؟ ✨"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              className="bg-transparent border-0 resize-none focus-visible:ring-0 min-h-[80px] p-0 text-base"
            />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-ice-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-cyan-glow" />
                <span>{content.length}/2000</span>
              </div>
              <Button
                onClick={handlePost}
                disabled={!content.trim() || posting}
                size="sm"
                className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {posting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 me-1.5" /> نشر
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* New posts banner */}
      {newPostsCount > 0 && (
        <button
          onClick={loadNewPosts}
          className="w-full mb-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-glow/20 to-violet-glow/20 border border-cyan-glow/30 text-cyan-glow text-sm font-medium flex items-center justify-center gap-2 hover:from-cyan-glow/30 hover:to-violet-glow/30 transition-all backdrop-blur-xl"
        >
          <RefreshCw className="h-4 w-4 animate-pulse" />
          {newPostsCount} منشور جديد — اضغط للتحديث
        </button>
      )}

      {/* Posts list */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-glow" />
            <p className="text-sm text-muted-foreground mt-3">جاري التحميل...</p>
          </div>
        )}
        {!isLoading && posts?.length === 0 && (
          <Card className="p-12 text-center bg-ice-card border-ice-border backdrop-blur-xl">
            <Sparkles className="h-12 w-12 mx-auto text-cyan-glow mb-3 opacity-50" />
            <p className="text-muted-foreground">لا توجد منشورات بعد. كن أول من ينشر!</p>
          </Card>
        )}
        {posts?.map((p) => (
          <PostCard key={p.id} post={p} onChange={refetch} />
        ))}
      </div>
    </PageShell>
  );
}
