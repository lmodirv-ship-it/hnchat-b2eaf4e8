import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Sparkles, RefreshCw, Brain, Zap, TrendingUp, BookOpen, Clock, Eye, ArrowRight } from "lucide-react";
import { useComposerColor } from "@/hooks/useComposerColor";
import { toast } from "sonner";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";
import { StoriesRail } from "@/components/stories/StoriesRail";
import { useEnergy } from "@/hooks/useEnergySystem";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";

import { MyChannelsCard } from "@/components/feed/MyChannelsCard";
import { UnifiedActivityFeed } from "@/components/landing/UnifiedActivityFeed";
import { GuestRegisterReminder } from "@/components/system/GuestRegisterReminder";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({
    meta: [
      { title: "التغذية — hnChat" },
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
  const { color: composerBg } = useComposerColor();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [promptIdx] = useState(() => Math.floor(Math.random() * AI_PROMPTS.length));
  const [focused, setFocused] = useState(false);

  async function handlePost() {
    if (!content.trim() || !user) {
      console.warn("[hnChat] handlePost blocked:", { hasContent: !!content.trim(), hasUser: !!user });
      if (!user) toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    setPosting(true);
    console.log("[hnChat] Creating post for user:", user.id);
    const { data, error } = await supabase
      .from("posts")
      .insert({ user_id: user.id, content: content.trim(), type: "post" as const })
      .select("id")
      .single();
    setPosting(false);
    if (error) {
      console.error("[hnChat] Post creation failed:", error);
      toast.error(`فشل النشر: ${error.message}`);
      return;
    }
    console.log("[hnChat] Post created successfully:", data?.id);
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
              style={composerBg ? { backgroundColor: composerBg } : undefined}
              className={`border-0 resize-none focus-visible:ring-0 min-h-[60px] sm:min-h-[80px] p-2 rounded-lg text-sm placeholder:text-[oklch(0.35_0.03_250)] ${composerBg ? "" : "bg-transparent"}`}
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

/* ═══ Article Card for Feed ═══ */
function FeedArticleCard({ article }: { article: any }) {
  const profile = article.profiles;
  const category = article.article_categories;
  return (
    <Link to="/blog/$articleId" params={{ articleId: article.short_id ?? article.id }} className="block group">
      <div className="rounded-2xl bg-[oklch(0.06_0.015_260/0.5)] border border-[oklch(1_0_0/0.05)] overflow-hidden hover:border-[oklch(0.78_0.18_220/0.3)] transition-all duration-300">
        {article.cover_image && (
          <div className="h-40 overflow-hidden">
            <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="p-4">
          {category?.name && (
            <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-[oklch(0.78_0.18_220/0.1)] text-[oklch(0.78_0.18_220)] mb-2">
              {category.name}
            </span>
          )}
          <h3 className="text-sm font-bold text-[oklch(0.92_0.03_250)] mb-1.5 line-clamp-2 group-hover:text-[oklch(0.78_0.18_220)] transition-colors">
            {article.title}
          </h3>
          {article.short_description && (
            <p className="text-xs text-[oklch(0.5_0.03_250)] line-clamp-2 mb-3">{article.short_description}</p>
          )}
          <div className="flex items-center justify-between text-[10px] text-[oklch(0.45_0.03_250)]">
            <div className="flex items-center gap-2">
              {profile?.avatar_url && <img src={profile.avatar_url} className="w-5 h-5 rounded-full" alt="" />}
              <span>{profile?.full_name || profile?.username || "كاتب"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.read_time ?? 3} د</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeedPage() {
  const { user } = useAuth();
  const { activityPulse } = useEnergy();
  const { newPostsCount, clearNewPosts } = useRealtimeFeed();

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
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  function loadNewPosts() {
    clearNewPosts();
    refetch();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="w-full px-3 sm:px-6 py-4 sm:py-6">
      {/* Stories */}
      <StoriesRail />

      {/* AI Composer */}
      <div className="mb-6 mt-4">
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

      {/* Unified feed: articles + channel videos + posts + live, sorted by date */}
      <UnifiedActivityFeed lang="ar" variant="embedded" />

      {/* Guest register reminder — bottom of feed, embedded */}
      <div className="mt-8 mb-2">
        <GuestRegisterReminder variant="bottom" />
      </div>

      {/* Bottom spacer for mobile nav */}
      <div className="h-8" />
    </div>
  );
}
