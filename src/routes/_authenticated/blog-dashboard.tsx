import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useMyArticles, useDeleteArticle } from "@/hooks/useBlog";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Eye, Edit, Trash2, Clock, Calendar, ExternalLink, Heart, Search, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/blog-dashboard")({
  component: BlogDashboard,
});

function BlogDashboard() {
  const { data: articles = [], isLoading } = useMyArticles();
  const deleteArticle = useDeleteArticle();
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = articles;
    if (activeTab === "published") list = list.filter(a => a.status === "published");
    if (activeTab === "draft") list = list.filter(a => a.status === "draft");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q));
    }
    return list;
  }, [articles, activeTab, searchQuery]);

  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status === "draft");
  const totalViews = articles.reduce((s, a) => s + a.views_count, 0);
  const totalLikes = articles.reduce((s, a) => s + a.likes_count, 0);

  return (
    <PageShell title="المدونة">
      <div className="w-full" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-6 rounded-2xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)]">
          <div>
            <h1 className="text-2xl font-bold mb-2">مقالاتي</h1>
            <div className="flex items-center gap-5 text-sm text-muted-foreground/50">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {published.length} منشور
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> {drafts.length} مسودة
              </span>
            </div>
          </div>
          <Link to="/blog-editor" search={{} as any}>
            <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground px-6 h-11 font-semibold">
              <Plus className="h-4 w-4 ml-1.5" /> إنشاء مقال جديد
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {articles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "المقالات", value: articles.length, icon: FileText, color: "cyan-glow" },
              { label: "المنشور", value: published.length, icon: BarChart3, color: "emerald-500" },
              { label: "المشاهدات", value: totalViews, icon: Eye, color: "violet-glow" },
              { label: "الإعجابات", value: totalLikes, icon: Heart, color: "red-400" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)]">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-4 w-4 text-${stat.color}`} />
                  <span className="text-xs text-muted-foreground/40">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs & Search */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[oklch(0.14_0.02_250)] border border-ice-border/10">
            {([
              { key: "all" as const, label: "الكل", count: articles.length },
              { key: "published" as const, label: "منشور", count: published.length },
              { key: "draft" as const, label: "مسودة", count: drafts.length },
            ]).map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-ice-card/15 text-foreground shadow-sm"
                    : "text-muted-foreground/50 hover:text-foreground"
                }`}>
                {tab.label} <span className="text-[10px] text-muted-foreground/30">({tab.count})</span>
              </button>
            ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المقالات..."
              className="bg-[oklch(0.14_0.02_250)] border-ice-border/10 pr-10 h-10 text-sm" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-[oklch(0.14_0.02_250)] animate-pulse" />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-28 rounded-3xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)]">
            <FileText className="h-16 w-16 text-muted-foreground/10 mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">لا توجد مقالات بعد</h3>
            <p className="text-sm text-muted-foreground/40 mb-7">ابدأ بكتابة أول مقال لك وشاركه مع العالم</p>
            <Link to="/blog-editor" search={{} as any}>
              <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground px-8 h-11">
                <Plus className="h-4 w-4 ml-1.5" /> إنشاء مقال
              </Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)]">
            <Search className="h-10 w-10 text-muted-foreground/15 mx-auto mb-4" />
            <p className="text-muted-foreground/40">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((article) => (
              <div key={article.id}
                className="flex items-center gap-5 p-5 rounded-2xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)] hover:border-cyan-glow/15 hover:shadow-[0_8px_40px_oklch(0.78_0.18_220/0.04)] transition-all duration-500 group">
                {/* Large Thumbnail */}
                {article.featured_image ? (
                  <img src={article.featured_image} alt="" className="w-40 h-28 rounded-xl object-cover shrink-0 group-hover:scale-[1.02] transition-transform duration-500" />
                ) : (
                  <div className="w-40 h-28 rounded-xl bg-gradient-to-br from-cyan-glow/8 to-violet-glow/8 flex items-center justify-center shrink-0">
                    <FileText className="h-8 w-8 text-muted-foreground/15" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                      article.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                    }`}>
                      {article.status === "published" ? "منشور" : "مسودة"}
                    </span>
                    {article.article_categories && (
                      <span className="text-xs text-cyan-glow/60">{(article.article_categories as any).name_ar ?? (article.article_categories as any).name}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-base mb-2 truncate group-hover:text-cyan-glow transition-colors duration-300">{article.title}</h3>
                  <div className="flex items-center gap-5 text-[11px] text-muted-foreground/40">
                    <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{article.views_count}</span>
                    <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" />{article.likes_count}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{article.reading_time} د</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(article.updated_at).toLocaleDateString("ar")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {article.status === "published" && (
                    <a href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/40 hover:text-cyan-glow">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <Link to="/blog-editor" search={{ id: article.id } as any}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/40 hover:text-cyan-glow">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground/40 hover:text-destructive"
                    onClick={() => { if (confirm("هل تريد حذف هذا المقال؟")) deleteArticle.mutate(article.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
