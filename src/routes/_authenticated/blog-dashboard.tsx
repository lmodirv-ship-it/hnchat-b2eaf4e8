import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMyArticles, useDeleteArticle } from "@/hooks/useBlog";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Eye, Edit, Trash2, Clock, Calendar, ExternalLink, Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/blog-dashboard")({
  component: BlogDashboard,
});

function BlogDashboard() {
  const { data: articles = [], isLoading } = useMyArticles();
  const deleteArticle = useDeleteArticle();

  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status === "draft");

  return (
    <PageShell title="المدونة">
      <div className="max-w-6xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 p-5 rounded-2xl border border-ice-border/15 bg-ice-card/5 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold mb-1">مقالاتي</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground/60">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> {published.length} منشور
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> {drafts.length} مسودة
              </span>
              <span>{articles.length} إجمالي</span>
            </div>
          </div>
          <Link to="/blog-editor" search={{} as any}>
            <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground px-6">
              <Plus className="h-4 w-4 ml-1" /> إنشاء مقال جديد
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-ice-card/10 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-ice-border/15 bg-ice-card/5">
            <FileText className="h-16 w-16 text-muted-foreground/20 mx-auto mb-5" />
            <h3 className="text-xl font-bold mb-2">لا توجد مقالات بعد</h3>
            <p className="text-sm text-muted-foreground/50 mb-6">ابدأ بكتابة أول مقال لك وشاركه مع العالم</p>
            <Link to="/blog-editor" search={{} as any}>
              <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground px-8">
                <Plus className="h-4 w-4 ml-1" /> إنشاء مقال
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id}
                className="flex items-center gap-5 p-4 rounded-2xl border border-ice-border/15 bg-ice-card/5 hover:border-cyan-glow/20 hover:shadow-[0_8px_30px_oklch(0.78_0.18_220/0.05)] transition-all duration-500 group">
                {/* Large Thumbnail */}
                {article.featured_image ? (
                  <img src={article.featured_image} alt="" className="w-36 h-24 rounded-xl object-cover shrink-0 group-hover:scale-[1.02] transition-transform" />
                ) : (
                  <div className="w-36 h-24 rounded-xl bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 flex items-center justify-center shrink-0">
                    <FileText className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      article.status === "published"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    }`}>
                      {article.status === "published" ? "منشور" : "مسودة"}
                    </span>
                    {article.article_categories && (
                      <span className="text-xs text-cyan-glow/70">{(article.article_categories as any).name_ar ?? (article.article_categories as any).name}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-base mb-1.5 truncate group-hover:text-cyan-glow transition-colors">{article.title}</h3>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground/50">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{article.views_count} مشاهدة</span>
                    <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{article.likes_count} إعجاب</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.reading_time} دقيقة</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(article.updated_at).toLocaleDateString("ar")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {article.status === "published" && (
                    <a href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-cyan-glow">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  <Link to="/blog-editor" search={{ id: article.id } as any}>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-cyan-glow">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive"
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
