import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/feed")({
  component: FeedPage,
});

function FeedPage() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const { data: posts, refetch, isLoading } = useQuery({
    queryKey: ["feed-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, media_urls, likes_count, comments_count, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const userIds = [...new Set((data ?? []).map((p) => p.user_id))];
      const { data: profs } = await supabase.from("profiles").select("id, username, full_name, avatar_url").in("id", userIds);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((p) => ({ ...p, profile: map.get(p.user_id) }));
    },
  });

  async function handlePost() {
    if (!content.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({ user_id: user.id, content: content.trim(), type: "post" });
    setPosting(false);
    if (error) return toast.error(error.message);
    setContent("");
    toast.success("Posted!");
    refetch();
  }

  async function handleLike(postId: string) {
    if (!user) return;
    const { error } = await supabase.from("likes").insert({ user_id: user.id, post_id: postId });
    if (error && !error.message.includes("duplicate")) toast.error(error.message);
    refetch();
  }

  return (
    <PageShell title="Feed" subtitle="What's happening in your world">
      <Card className="p-4 mb-6 bg-ice-card border-ice-border backdrop-blur-xl">
        <Textarea
          placeholder="Share something diamond-bright..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-transparent border-0 resize-none focus-visible:ring-0 min-h-[80px]"
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={handlePost}
            disabled={!content.trim() || posting}
            size="sm"
            className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5 me-1.5" /> Post</>}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {isLoading && <div className="text-center py-12 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>}
        {posts?.length === 0 && <div className="text-center py-12 text-muted-foreground">No posts yet. Be the first!</div>}
        {posts?.map((p) => (
          <Card key={p.id} className="p-4 bg-ice-card border-ice-border backdrop-blur-xl hover:shadow-[0_0_24px_oklch(0.78_0.18_220/0.15)] transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center text-sm font-bold text-primary-foreground">
                {p.profile?.username?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{p.profile?.full_name ?? p.profile?.username ?? "User"}</div>
                <div className="text-xs text-muted-foreground">@{p.profile?.username} · {formatDistanceToNow(new Date(p.created_at))} ago</div>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap mb-3">{p.content}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button onClick={() => handleLike(p.id)} className="flex items-center gap-1.5 hover:text-pink-glow transition-colors">
                <Heart className="h-4 w-4" /> {p.likes_count}
              </button>
              <button className="flex items-center gap-1.5 hover:text-cyan-glow transition-colors">
                <MessageCircle className="h-4 w-4" /> {p.comments_count}
              </button>
              <button className="flex items-center gap-1.5 hover:text-violet-glow transition-colors">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
