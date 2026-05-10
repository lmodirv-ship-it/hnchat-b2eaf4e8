import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, Heart, ArrowRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — تصنيفات hnChat` },
      { name: "description", content: `اكتشف أفضل المقالات والأدوات في تصنيف ${params.slug} على hnChat` },
      { property: "og:title", content: `${params.slug} — تصنيفات hnChat` },
      { property: "og:description", content: `أفضل محتوى في تصنيف ${params.slug}` },
    ],
  }),
  component: CategoryPage,
});

function useCategoryInfo(slug: string) {
  return useQuery({
    queryKey: ["content-category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

function useCategoryArticles(slug: string) {
  return useQuery({
    queryKey: ["category-articles", slug],
    queryFn: async () => {
      // Try matching by article_categories.slug or category_slug
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, short_description, featured_image, views_count, likes_count, reading_time, published_at, profiles(username, full_name, avatar_url), article_categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      // Filter client-side by category slug
      return (data || []).filter(
        (a: any) => a.article_categories?.slug === slug || a.category_slug === slug
      );
    },
    enabled: !!slug,
  });
}

function useCategoryTools(slug: string) {
  return useQuery({
    queryKey: ["category-tools", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("id, name, slug, description, rating, is_free, category_slug")
        .eq("category_slug", slug)
        .order("rating", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
    enabled: !!slug,
  });
}

const categoryNames: Record<string, string> = {
  "ai-tools": "أدوات الذكاء الاصطناعي",
  chatgpt: "ChatGPT",
  tutorials: "دروس تعليمية",
  news: "أخبار AI",
  programming: "البرمجة",
  design: "التصميم",
  "video-ai": "فيديو AI",
  writing: "الكتابة",
  "image-generation": "توليد الصور",
  coding: "البرمجة",
  productivity: "الإنتاجية",
  "search-ai": "البحث الذكي",
  automation: "الأتمتة",
};

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: category } = useCategoryInfo(slug);
  const { data: articles = [], isLoading } = useCategoryArticles(slug);
  const { data: tools = [] } = useCategoryTools(slug);

  const displayName = category?.name || categoryNames[slug] || slug;

  return (
    <PublicPageShell dir="rtl">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <span className="text-foreground">{displayName}</span>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">{displayName}</h1>
          {category?.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>

        {/* Tools for this category */}
        {tools.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-4">🛠️ أدوات في هذا التصنيف</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tools.map((tool: any) => (
                <Link
                  key={tool.id}
                  to="/tools/$slug"
                  params={{ slug: tool.slug }}
                  className="rounded-xl border border-border/20 bg-card/40 p-4 hover:border-primary/30 transition-all"
                >
                  <h3 className="font-bold text-foreground text-sm">{tool.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{tool.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">📝 مقالات في هذا التصنيف</h2>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-card/30 animate-pulse" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-border/20 bg-card/30">
              <p className="text-muted-foreground">لا توجد مقالات بعد في هذا التصنيف</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article: any) => (
                <Link
                  key={article.id}
                  to="/blog/$articleId"
                  params={{ articleId: article.short_id ?? article.id }}
                  className="group flex gap-4 rounded-xl border border-border/20 bg-card/40 p-4 hover:border-primary/30 transition-all"
                >
                  {article.featured_image && (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-24 h-20 rounded-lg object-cover shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{article.short_description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views_count}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {article.likes_count}</span>
                      {article.reading_time && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.reading_time} د</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="mt-12">
          <NewsletterSignup source={`category-${slug}`} />
        </div>
      </div>
    </PublicPageShell>
  );
}
