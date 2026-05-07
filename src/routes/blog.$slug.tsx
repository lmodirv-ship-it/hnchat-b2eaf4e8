import { createFileRoute, Link } from "@tanstack/react-router";
import { useArticleBySlug } from "@/hooks/useBlog";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Calendar, Clock, Eye, User, ArrowLeft, Tag } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "hnChat Blog" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article, isLoading, error } = useArticleBySlug(slug);

  if (isLoading) {
    return (
      <PublicPageShell dir="ltr">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-ice-card/10 animate-pulse rounded" />
            <div className="h-64 bg-ice-card/10 animate-pulse rounded-2xl" />
            <div className="h-4 w-full bg-ice-card/10 animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-ice-card/10 animate-pulse rounded" />
          </div>
        </div>
      </PublicPageShell>
    );
  }

  if (error || !article) {
    return (
      <PublicPageShell dir="ltr">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-2">Article not found</h1>
          <Link to="/blog" className="text-cyan-glow hover:underline">← Back to Blog</Link>
        </div>
      </PublicPageShell>
    );
  }

  const isRTL = article.language === "ar";

  return (
    <PublicPageShell dir={isRTL ? "rtl" : "ltr"}>
      <article className="max-w-4xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-cyan-glow hover:underline mb-6">
          <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} /> {isRTL ? "العودة للمدونة" : "Back to Blog"}
        </Link>

        {/* Category */}
        {(article.article_categories as any) && (
          <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-cyan-glow/80 to-violet-glow/80 text-white mb-4">
            {isRTL ? (article.article_categories as any).name_ar : (article.article_categories as any).name}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{article.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/60 mb-6">
          <div className="flex items-center gap-2">
            {(article.profiles as any)?.avatar_url ? (
              <img src={(article.profiles as any).avatar_url} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-ice-card/20 flex items-center justify-center"><User className="h-4 w-4" /></div>
            )}
            <Link to={`/blog/author/${(article.profiles as any)?.username}` as any} className="font-medium text-foreground hover:text-cyan-glow transition">
              {(article.profiles as any)?.full_name ?? (article.profiles as any)?.username}
            </Link>
          </div>
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{article.published_at ? new Date(article.published_at).toLocaleDateString(isRTL ? "ar" : "en") : ""}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{article.reading_time} {isRTL ? "دقائق" : "min"}</span>
          <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{article.views_count} {isRTL ? "مشاهدة" : "views"}</span>
        </div>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="rounded-2xl overflow-hidden border border-ice-border/15 mb-8">
            <img src={article.featured_image} alt={article.title} className="w-full h-auto max-h-[500px] object-cover" />
          </div>
        )}

        {/* Video */}
        {article.video_url && (
          <div className="rounded-2xl overflow-hidden border border-ice-border/15 mb-8 aspect-video">
            {article.video_url.includes("youtube") || article.video_url.includes("youtu.be") ? (
              <iframe
                src={article.video_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <video src={article.video_url} controls className="w-full h-full" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-cyan max-w-none text-base leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-ice-border/15">
            <Tag className="h-4 w-4 text-muted-foreground/40" />
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs rounded-full bg-ice-card/10 border border-ice-border/15 text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio */}
        {(article.profiles as any) && (
          <div className="mt-8 p-6 rounded-2xl border border-ice-border/15 bg-ice-card/5 flex items-start gap-4">
            {(article.profiles as any).avatar_url ? (
              <img src={(article.profiles as any).avatar_url} alt="" className="h-14 w-14 rounded-full shrink-0" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-ice-card/20 flex items-center justify-center shrink-0"><User className="h-6 w-6" /></div>
            )}
            <div>
              <Link to={`/blog/author/${(article.profiles as any).username}` as any} className="font-bold text-lg hover:text-cyan-glow transition">
                {(article.profiles as any).full_name ?? (article.profiles as any).username}
              </Link>
              {(article.profiles as any).bio && (
                <p className="text-sm text-muted-foreground/60 mt-1">{(article.profiles as any).bio}</p>
              )}
            </div>
          </div>
        )}
      </article>
    </PublicPageShell>
  );
}
