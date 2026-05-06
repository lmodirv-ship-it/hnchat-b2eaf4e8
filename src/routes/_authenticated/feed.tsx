import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Sparkles, RefreshCw, Brain, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";
import { StoriesRail } from "@/components/stories/StoriesRail";
import { useEnergy } from "@/hooks/useEnergySystem";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({
    meta: [
      { title: "التغذية — HN-Chat | دردشة ذكاء اصطناعي وشبكة تواصل" },
      { name: "description", content: "تصفّح آخر المنشورات والقصص على HN-Chat. شبكة تواصل اجتماعي عربية مع دردشة ذكاء اصطناعي مدمجة." },
    ],
  }),
  component: FeedPage,
});

const AI_PROMPTS = [
  "شارك فكرة مشروعك القادم...",
  "ما الذي تعلمته اليوم؟",
  "اكتب شيئاً يُلهم الآخرين...",
  "ما رأيك في آخر تحديثات الذكاء الاصطناعي؟",
  "شارك إنجازاً فخور به...",
];

function AiComposer({ onPost }: { onPost: () => void }) {
  const { user } = useAuth();
  const { mode, activityPulse } = useEnergy();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [promptIdx] = useState(() => Math.floor(Math.random() * AI_PROMPTS.length));
  const [focused, setFocused] = useState(false);

  async function handlePost() {
    if (!content.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({ user_id: user.id, content: content.trim(), type: "post" });
    setPosting(false);
    if (error) return toast.error(error.message);
    setContent("");
    activityPulse();
    toast.success("تم النشر بنجاح ✨");
    onPost();
  }

  const modeColors: Record<string, string> = {
    focus: "oklch(0.78 0.18 220)",
    creative: "oklch(0.72 0.22 340)",
    social: "oklch(0.7 0.2 160)",
    "deep-ai": "oklch(0.65 0.25 295)",
  };
  const activeColor = modeColors[mode] ?? modeColors.focus;

  return (
    <div className={`relative rounded-2xl transition-all duration-700 ${focused ? "scale-[1.005]" : ""}`}>
      {/* Glow border on focus */}
      <div
        className={`absolute -inset-px rounded-2xl transition-all duration-700 ${focused ? "opacity-100" : "opacity-0"}`}
        style={{
          background: `linear-gradient(135deg, ${activeColor}30, transparent 40%, ${activeColor}20)`,
          filter: "blur(1px)",
        }}
      />

      <div className="relative p-4 sm:p-5 bg-[oklch(0.06_0.015_260/0.7)] border border-[oklch(1_0_0/0.06)] backdrop-blur-2xl rounded-2xl">
        {/* AI status bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[oklch(1_0_0/0.03)] border border-[oklch(1_0_0/0.05)]">
            <Brain className="h-3 w-3 animate-breathe" style={{ color: activeColor }} />
            <span className="text-[9px] font-medium" style={{ color: activeColor }}>AI Composer</span>
          </div>
          <div className="flex-1" />
          <span className="text-[9px] text-[oklch(0.4_0.03_250)] tabular-nums">{content.length}/2000</span>
        </div>

        <div className="flex gap-3">
          <div
            className="h-10 w-10 rounded-full bg-gradient-to-br from-[oklch(0.78_0.18_220)] to-[oklch(0.65_0.25_295)] flex items-center justify-center text-sm font-bold text-[oklch(0.04_0.01_280)] shrink-0 ring-2 ring-[oklch(0.06_0.015_260)]"
          >
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <Textarea
              placeholder={AI_PROMPTS[promptIdx]}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={2000}
              className="bg-transparent border-0 resize-none focus-visible:ring-0 min-h-[60px] sm:min-h-[80px] p-0 text-sm placeholder:text-[oklch(0.35_0.03_250)]"
            />
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[oklch(1_0_0/0.04)]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" style={{ color: activeColor }} />
                <span className="text-[10px] text-[oklch(0.4_0.03_250)]">AI-Enhanced</span>
              </div>
              <Button
                onClick={handlePost}
                disabled={!content.trim() || posting}
                size="sm"
                className="bg-gradient-to-r from-[oklch(0.78_0.18_220)] to-[oklch(0.65_0.25_295)] text-[oklch(0.04_0.01_280)] hover:opacity-90 disabled:opacity-30 active:scale-95 transition-all h-8 px-4 rounded-xl font-semibold text-xs shadow-[0_0_20px_oklch(0.78_0.18_220/0.2)]"
              >
                {posting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 me-1" /> نشر
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Feed Insights — AI-driven context ═══ */
function FeedInsights({ postsCount }: { postsCount: number }) {
  return (
    <div className="flex items-center gap-3 mb-5 overflow-x-auto pb-1">
      {[
        { icon: TrendingUp, label: "رائج", value: `${postsCount} منشور`, color: "oklch(0.78 0.18 220)" },
        { icon: Zap, label: "نشط", value: "الآن", color: "oklch(0.7 0.2 160)" },
        { icon: Brain, label: "AI", value: "مُفعّل", color: "oklch(0.65 0.25 295)" },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[oklch(0.06_0.015_260/0.5)] border border-[oklch(1_0_0/0.04)] shrink-0">
            <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
            <span className="text-[10px] text-[oklch(0.55_0.03_250)]">{item.label}</span>
            <span className="text-[10px] font-medium text-[oklch(0.75_0.03_250)]">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function FeedPage() {
  const { user } = useAuth();
  const { activityPulse } = useEnergy();
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
        supabase.from("profiles").select("id, username, full_name, avatar_url, is_verified").in("id", userIds),
        user
          ? supabase.from("likes").select("post_id").eq("user_id", user.id).in("post_id", (data ?? []).map((p) => p.id))
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

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("feed-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        const newPost = payload.new as { user_id: string } | null;
        if (newPost && newPost.user_id !== user?.id) {
          setNewPostsCount((n) => n + 1);
          activityPulse();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, activityPulse]);

  function loadNewPosts() {
    setNewPostsCount(0);
    refetch();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-[oklch(0.92_0.03_250)]">التغذية</h1>
        <p className="text-xs text-[oklch(0.45_0.03_250)] mt-0.5">اكتشف ما يحدث في عالمك الآن</p>
      </div>

      {/* Stories */}
      <StoriesRail />

      {/* Feed Insights */}
      <FeedInsights postsCount={posts?.length ?? 0} />

      {/* AI Composer */}
      <div className="mb-6">
        <AiComposer onPost={refetch} />
      </div>

      {/* New posts banner */}
      {newPostsCount > 0 && (
        <button
          onClick={loadNewPosts}
          className="w-full mb-5 py-2.5 rounded-xl bg-[oklch(0.78_0.18_220/0.08)] border border-[oklch(0.78_0.18_220/0.2)] text-[oklch(0.78_0.18_220)] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[oklch(0.78_0.18_220/0.12)] transition-all backdrop-blur-xl"
        >
          <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: "3s" }} />
          {newPostsCount} منشور جديد — اضغط للتحديث
        </button>
      )}

      {/* Posts */}
      <div className="space-y-4 sm:space-y-5">
        {isLoading && (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <Loader2 className="h-10 w-10 animate-spin text-[oklch(0.78_0.18_220)]" />
              <div className="absolute inset-0 h-10 w-10 rounded-full bg-[oklch(0.78_0.18_220/0.15)] blur-xl animate-breathe" />
            </div>
            <p className="text-xs text-[oklch(0.45_0.03_250)] mt-4">جاري تحميل التغذية...</p>
          </div>
        )}
        {!isLoading && posts?.length === 0 && (
          <div className="p-16 text-center rounded-2xl bg-[oklch(0.06_0.015_260/0.5)] border border-[oklch(1_0_0/0.05)]">
            <Sparkles className="h-12 w-12 mx-auto text-[oklch(0.78_0.18_220)] mb-4 opacity-40" />
            <p className="text-[oklch(0.5_0.03_250)] text-sm">لا توجد منشورات بعد. كن أول من ينشر!</p>
          </div>
        )}
        {posts?.map((p) => (
          <PostCard key={p.id} post={p} onChange={refetch} />
        ))}
      </div>

      {/* Bottom spacer for mobile nav */}
      <div className="h-8" />
    </div>
  );
}
