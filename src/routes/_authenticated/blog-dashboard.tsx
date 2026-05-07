import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMyArticles, useDeleteArticle } from "@/hooks/useBlog";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Eye, Edit, Trash2, Clock, Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/blog-dashboard")({
  component: BlogDashboard,
});

function BlogDashboard() {
  const { data: articles = [], isLoading } = useMyArticles();
  const deleteArticle = useDeleteArticle();

  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status === "draft");

  return (
    <PageShell title="المدونة" icon={<FileText className="h-5 w-5 text-cyan-glow" />}>
      <div className="max-w-5xl mx-auto" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">مقالاتي</h1>
            <p className="text-sm text-muted-foreground">{articles.length} مقال • {published.length} منشور • {drafts.length} مسودة</p>
          </div>
          <Link to="/blog-editor" search={{} as any}>
            <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
              <Plus className="h-4 w-4 ml-1" /> إنشاء مقال جديد
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-ice-card/10 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مقالات بعد</h3>
            <p className="text-sm text-muted-foreground mb-4">ابدأ بكتابة أول مقال لك</p>
            <Link to="/blog-editor" search={{} as any}>
              <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
                <Plus className="h-4 w-4 ml-1" /> إنشاء مقال
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center gap-4 p-4 rounded-xl border border-ice-border/15 bg-ice-card/5 hover:bg-ice-card/10 transition group">
                {/* Image */}
                {article.featured_image ? (
                  <img src={article.featured_image} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-14 rounded-lg bg-ice-card/20 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{article.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground/60">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${article.status === "published" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {article.status === "published" ? "منشور" : "مسودة"}
                    </span>
                    {article.article_categories && (
                      <span>{(article.article_categories as any).name_ar ?? (article.article_categories as any).name}</span>
                    )}
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time} د</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(article.updated_at).toLocaleDateString("ar")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Link to="/blog-editor" search={{ id: article.id } as any}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
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
