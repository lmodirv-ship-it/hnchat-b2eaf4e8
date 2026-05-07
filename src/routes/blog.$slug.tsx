import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useArticleBySlug, useArticleComments, useAddArticleComment, useDeleteArticleComment, useArticleLike, usePublishedArticles } from "@/hooks/useBlog";
import { useAuth } from "@/lib/auth";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Eye, User, ArrowLeft, Tag, Heart, MessageCircle, Share2, Twitter, Facebook, Copy, FileText, Bookmark } from "lucide-react";
import { toast } from "sonner";

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
          <div className="space-y-6">
            <div className="h-12 w-2/3 bg-[oklch(0.14_0.02_250)] animate-pulse rounded-xl" />
            <div className="h-[400px] bg-[oklch(0.14_0.02_250)] animate-pulse rounded-3xl" />
            <div className="h-4 w-full bg-[oklch(0.14_0.02_250)] animate-pulse rounded" />
          </div>
        </div>
      </PublicPageShell>
    );
  }

  if (error || !article) {
    return (
      <PublicPageShell dir="ltr">
        <div className="text-center py-24">
          <FileText className="h-14 w-14 text-muted-foreground/15 mx-auto mb-5" />
          <h1 className="text-2xl font-bold mb-3">Article not found</h1>
          <Link to="/blog" className="text-cyan-glow hover:underline underline-offset-4">← Back to Blog</Link>
        </div>
      </PublicPageShell>
    );
  }

  const isRTL = article.language === "ar";

  return (
    <PublicPageShell dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Cover */}
      {article.featured_image && (
        <div className="relative w-full h-[55vh] max-h-[550px] overflow-hidden">
          <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6">
        <article className={`${article.featured_image ? "-mt-28" : "mt-10"} relative z-10`}>
          {/* Back */}
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-cyan-glow/70 hover:text-cyan-glow transition mb-6">
            <ArrowLeft className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} /> {isRTL ? "العودة للمدونة" : "Back to Blog"}
          </Link>

          {/* Category */}
          {(article.article_categories as any) && (
            <span className="inline-block px-4 py-1.5 text-[11px] font-bold rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow text-white mb-5 tracking-wider uppercase">
              {isRTL ? (article.article_categories as any).name_ar : (article.article_categories as any).name}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-bold mb-8 leading-[1.15] tracking-tight">{article.title}</h1>

          {/* Author & Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground/50 mb-8 pb-8 border-b border-ice-border/10">
            <Link to={`/blog/author/${(article.profiles as any)?.username}` as any} className="flex items-center gap-3 hover:text-cyan-glow transition">
              {(article.profiles as any)?.avatar_url ? (
                <img src={(article.profiles as any).avatar_url} alt="" className="h-11 w-11 rounded-full ring-2 ring-cyan-glow/15" />
              ) : (
                <div className="h-11 w-11 rounded-full bg-[oklch(0.18_0.02_250)] flex items-center justify-center ring-2 ring-ice-border/15"><User className="h-5 w-5" /></div>
              )}
              <div>
                <span className="font-semibold text-foreground/80 block text-base">{(article.profiles as any)?.full_name ?? (article.profiles as any)?.username}</span>
                <span className="text-xs text-muted-foreground/40">@{(article.profiles as any)?.username}</span>
              </div>
            </Link>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{article.published_at ? new Date(article.published_at).toLocaleDateString(isRTL ? "ar" : "en", { year: 'numeric', month: 'long', day: 'numeric' }) : ""}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{article.reading_time} {isRTL ? "دقائق" : "min read"}</span>
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{article.views_count}</span>
            </div>
          </div>

          {/* Sticky Social Bar */}
          <StickyShareBar article={article} isRTL={isRTL} />

          {/* Video */}
          {article.video_url && (
            <div className="rounded-2xl overflow-hidden border border-ice-border/10 mb-10 aspect-video bg-[oklch(0.12_0.02_250)]">
              {article.video_url.includes("youtube") || article.video_url.includes("youtu.be") ? (
                <iframe
                  src={article.video_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                  className="w-full h-full" allowFullScreen loading="lazy" />
              ) : (
                <video src={article.video_url} controls className="w-full h-full" />
              )}
            </div>
          )}

          {/* Content */}
          <div className="mb-12" style={{ fontSize: '1.15rem', lineHeight: '2', letterSpacing: '0.01em' }}>
            <ArticleContent content={article.content ?? ""} />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 mb-12 pt-8 border-t border-ice-border/10">
              <Tag className="h-4 w-4 text-muted-foreground/30" />
              {article.tags.map((tag) => (
                <span key={tag} className="px-4 py-1.5 text-xs rounded-full bg-[oklch(0.14_0.02_250)] border border-ice-border/10 text-muted-foreground/60 hover:border-cyan-glow/25 hover:text-cyan-glow transition">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Bio Card */}
          {(article.profiles as any) && (
            <div className="p-7 rounded-2xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)] flex items-start gap-5 mb-12">
              {(article.profiles as any).avatar_url ? (
                <img src={(article.profiles as any).avatar_url} alt="" className="h-16 w-16 rounded-full shrink-0 ring-2 ring-cyan-glow/15" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[oklch(0.18_0.02_250)] flex items-center justify-center shrink-0"><User className="h-7 w-7" /></div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Link to={`/blog/author/${(article.profiles as any).username}` as any} className="font-bold text-lg hover:text-cyan-glow transition">
                    {(article.profiles as any).full_name ?? (article.profiles as any).username}
                  </Link>
                  <Link to={`/blog/author/${(article.profiles as any).username}` as any}>
                    <Button variant="outline" size="sm" className="border-cyan-glow/20 text-cyan-glow hover:bg-cyan-glow/10 text-xs">
                      {isRTL ? "جميع المقالات" : "All Articles"} →
                    </Button>
                  </Link>
                </div>
                {(article.profiles as any).bio && (
                  <p className="text-sm text-muted-foreground/50 leading-relaxed">{(article.profiles as any).bio}</p>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentsSection articleId={article.id} isRTL={isRTL} />

          {/* Related */}
          <RelatedArticles currentSlug={slug} />
        </article>
      </div>
    </PublicPageShell>
  );
}

function ArticleContent({ content }: { content: string }) {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-4 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-5 text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-12 mb-6 text-foreground">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/gm, '<pre class="p-5 rounded-xl bg-[oklch(0.12_0.02_250)] border border-ice-border/10 overflow-x-auto my-5"><code class="text-sm font-mono text-cyan-glow/80">$1</code></pre>')
    .replace(/`(.+?)`/g, '<code class="px-2 py-1 rounded-lg bg-[oklch(0.15_0.02_250)] text-cyan-glow text-sm font-mono border border-ice-border/10">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-cyan-glow/25 pl-6 italic text-muted-foreground/60 my-6 text-lg">$1</blockquote>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-cyan-glow underline underline-offset-4 hover:text-cyan-glow/80 transition" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc mb-2 text-muted-foreground/70">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal mb-2 text-muted-foreground/70">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-5 text-muted-foreground/70 leading-relaxed">')
    .replace(/\n/g, '<br/>');
  return <div className="text-muted-foreground/70" dangerouslySetInnerHTML={{ __html: `<p class="mb-5 leading-relaxed">${html}</p>` }} />;
}

function StickyShareBar({ article, isRTL }: { article: any; isRTL: boolean }) {
  const { liked, toggle, isPending } = useArticleLike(article.id);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const share = (platform: string) => {
    const text = encodeURIComponent(article.title);
    const u = encodeURIComponent(url);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success(isRTL ? "تم نسخ الرابط" : "Link copied!");
  };

  return (
    <div className="flex items-center gap-2.5 mb-10 flex-wrap">
      <button onClick={() => toggle()} disabled={isPending}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${
          liked ? "bg-red-500/10 border-red-500/25 text-red-400" : "border-ice-border/15 text-muted-foreground/60 hover:border-red-500/25 hover:text-red-400"
        }`}>
        <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        <span>{article.likes_count}</span>
      </button>
      <button onClick={() => share('twitter')}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ice-border/15 text-sm text-muted-foreground/60 hover:border-[oklch(0.6_0.15_210)]/30 hover:text-[oklch(0.6_0.15_210)] transition-all duration-300">
        <Twitter className="h-4 w-4" />
      </button>
      <button onClick={() => share('facebook')}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ice-border/15 text-sm text-muted-foreground/60 hover:border-blue-500/25 hover:text-blue-400 transition-all duration-300">
        <Facebook className="h-4 w-4" />
      </button>
      <button onClick={copyLink}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ice-border/15 text-sm text-muted-foreground/60 hover:border-cyan-glow/25 hover:text-cyan-glow transition-all duration-300">
        <Copy className="h-4 w-4" /> {isRTL ? "نسخ" : "Copy"}
      </button>
    </div>
  );
}

function CommentsSection({ articleId, isRTL }: { articleId: string; isRTL: boolean }) {
  const { user } = useAuth();
  const { data: comments = [] } = useArticleComments(articleId);
  const addComment = useAddArticleComment();
  const deleteComment = useDeleteArticleComment();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await addComment.mutateAsync({ articleId, content: newComment.trim() });
    setNewComment("");
    toast.success(isRTL ? "تم إضافة التعليق" : "Comment added");
  };

  return (
    <div className="mb-14">
      <h3 className="text-xl font-bold mb-7 flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-cyan-glow/10"><MessageCircle className="h-4 w-4 text-cyan-glow" /></div>
        {isRTL ? "التعليقات" : "Comments"} <span className="text-muted-foreground/30 font-normal">({comments.length})</span>
      </h3>

      {user && (
        <div className="mb-8 p-5 rounded-2xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)]">
          <div className="flex items-start gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[oklch(0.18_0.02_250)] flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
              placeholder={isRTL ? "اكتب تعليقك..." : "Write a comment..."} rows={3}
              className="bg-transparent border-ice-border/10 text-sm resize-none" />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={addComment.isPending || !newComment.trim()} size="sm"
              className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground px-5">
              {isRTL ? "إرسال" : "Post"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="p-5 rounded-xl border border-ice-border/8 bg-[oklch(0.14_0.02_250)]">
            <div className="flex items-center gap-3 mb-3">
              {(c.profiles as any)?.avatar_url ? (
                <img src={(c.profiles as any).avatar_url} alt="" className="h-9 w-9 rounded-full" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-[oklch(0.18_0.02_250)] flex items-center justify-center"><User className="h-4 w-4" /></div>
              )}
              <div className="flex-1">
                <span className="text-sm font-semibold">{(c.profiles as any)?.full_name ?? (c.profiles as any)?.username}</span>
                <span className="text-[10px] text-muted-foreground/30 mr-3 ml-3">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              {user?.id === c.user_id && (
                <button onClick={() => deleteComment.mutate({ id: c.id, articleId })}
                  className="text-[11px] text-muted-foreground/30 hover:text-destructive transition px-2 py-1 rounded-lg hover:bg-destructive/10">
                  {isRTL ? "حذف" : "Delete"}
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground/60 leading-relaxed pr-12">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const { data: articles = [] } = usePublishedArticles({ limit: 4 });
  const related = articles.filter(a => a.slug !== currentSlug).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <div className="mb-16">
      <h3 className="text-xl font-bold mb-7 flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-violet-glow/10"><FileText className="h-4 w-4 text-violet-glow" /></div>
        Related Articles
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {related.map((a) => (
          <Link key={a.id} to="/blog/$slug" params={{ slug: a.slug }} className="group block">
            <article className="rounded-2xl overflow-hidden border border-ice-border/10 bg-[oklch(0.14_0.02_250)] hover:border-cyan-glow/20 transition-all duration-500">
              <div className="relative h-40 overflow-hidden">
                {a.featured_image ? (
                  <img src={a.featured_image} alt={a.title} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-glow/8 to-violet-glow/8" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.02_250)] to-transparent" />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-sm line-clamp-2 group-hover:text-cyan-glow transition-colors">{a.title}</h4>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground/30">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.reading_time} min</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.views_count}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
