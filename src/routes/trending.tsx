import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Eye, Heart, Sparkles, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Badge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { useFeaturedTools } from "@/hooks/useAiTools";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "المحتوى الرائج — hnChat" },
      { name: "description", content: "اكتشف أكثر المقالات قراءة وأفضل أدوات الذكاء الاصطناعي رواجًا هذا الأسبوع." },
      { property: "og:title", content: "المحتوى الرائج — hnChat" },
      { property: "og:description", content: "اكتشف أكثر المقالات قراءة وأفضل أدوات AI رواجًا." },
    ],
  }),
  component: TrendingPage,
});

function useTrendingArticles() {
  return useQuery({
    queryKey: ["trending-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, short_description, featured_image, views_count, likes_count, reading_time, published_at, profiles(username, full_name, avatar_url)")
        .eq("status", "published")
        .order("views_count", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });
}

function useMostLikedArticles() {
  return useQuery({
    queryKey: ["most-liked-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, short_description, views_count, likes_count, published_at, profiles(username, full_name)")
        .eq("status", "published")
        .order("likes_count", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });
}

function TrendingPage() {
  const { data: trendingArticles = [], isLoading: loadingTrending } = useTrendingArticles();
  const { data: likedArticles = [], isLoading: loadingLiked } = useMostLikedArticles();
  const { data: featuredTools = [] } = useFeaturedTools();

  return (
    <PublicPageShell dir="rtl">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            🔥 المحتوى الرائج
          </h1>
          <p className="text-muted-foreground">أكثر المقالات والأدوات رواجًا على hnChat</p>
        </div>

        {/* Most Viewed */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">الأكثر مشاهدة</h2>
          </div>
          {loadingTrending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-card/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingArticles.map((article, i) => (
                <Link
                  key={article.id}
                  to="/blog/$slug"
                  params={{ slug: article.slug }}
                  className="group rounded-2xl border border-border/20 bg-card/40 p-5 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-black text-primary/30">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.short_description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views_count}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {article.likes_count}</span>
                    {article.reading_time && <span>{article.reading_time} دقيقة</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Most Liked */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-foreground">الأكثر إعجابًا</h2>
          </div>
          {loadingLiked ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-card/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {likedArticles.map((article) => (
                <Link
                  key={article.id}
                  to="/blog/$slug"
                  params={{ slug: article.slug }}
                  className="flex items-center gap-4 rounded-xl border border-border/20 bg-card/40 p-4 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-1 text-red-400">
                    <Heart className="w-4 h-4 fill-red-400" />
                    <span className="text-sm font-bold">{article.likes_count}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{article.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {article.profiles?.full_name || article.profiles?.username}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {article.views_count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Trending Tools */}
        {featuredTools.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-foreground">أدوات AI الرائجة</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {featuredTools.map((tool) => (
                <Link
                  key={tool.id}
                  to="/tools/$slug"
                  params={{ slug: tool.slug }}
                  className="rounded-2xl border border-border/20 bg-card/40 p-4 hover:border-primary/30 transition-all text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{tool.name}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-muted-foreground">{Number(tool.rating).toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <NewsletterSignup source="trending-page" />
      </div>
    </PublicPageShell>
  );
}
