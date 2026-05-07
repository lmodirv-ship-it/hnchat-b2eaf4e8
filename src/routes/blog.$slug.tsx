import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useArticleBySlug, useArticleComments, useAddArticleComment, useDeleteArticleComment, useArticleLike, usePublishedArticles } from "@/hooks/useBlog";
import { useAuth } from "@/lib/auth";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Eye, User, ArrowLeft, Tag, Heart, MessageCircle, Share2, Bookmark, Twitter, Facebook, Copy, FileText } from "lucide-react";
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
  const { user } = useAuth();

  if (isLoading) {
    return (
      <PublicPageShell dir="ltr">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="space-y-4">
            <div className="h-10 w-2/3 bg-ice-card/10 animate-pulse rounded" />
            <div className="h-80 bg-ice-card/10 animate-pulse rounded-2xl" />
            <div className="h-4 w-full bg-ice-card/10 animate-pulse rounded" />
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
      {/* Hero Cover */}
      {article.featured_image && (
        <div className="relative w-full h-[50vh] max-h-[500px] overflow-hidden">
          <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        {/* Category */}
        {(article.article_categories as any) && (
          <span className="inline-block px-4 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow text-white mb-4">
            {isRTL ? (article.article_categories as any).name_ar : (article.article_categories as any).name}
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">{article.title}</h1>

        {/* Author & Meta Bar */}
        <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground/60 mb-8 pb-6 border-b border-ice-border/15">
          <Link to={`/blog/author/${(article.profiles as any)?.username}` as any} className="flex items-center gap-3 hover:text-cyan-glow transition">
            {(article.profiles as any)?.avatar_url ? (
              <img src={(article.profiles as any).avatar_url} alt="" className="h-10 w-10 rounded-full ring-2 ring-cyan-glow/20" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-ice-card/20 flex items-center justify-center ring-2 ring-ice-border/20"><User className="h-5 w-5" /></div>
            )}
            <div>
              <span className="font-semibold text-foreground block">{(article.profiles as any)?.full_name ?? (article.profiles as any)?.username}</span>
              <span className="text-xs">@{(article.profiles as any)?.username}</span>
            </div>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{article.published_at ? new Date(article.published_at).toLocaleDateString(isRTL ? "ar" : "en", { year: 'numeric', month: 'long', day: 'numeric' }) : ""}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{article.reading_time} {isRTL ? "دقائق" : "min read"}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{article.views_count}</span>
          </div>
        </div>

        {/* Social Actions */}
        <SocialActions article={article} isRTL={isRTL} />

        {/* Video */}
        {article.video_url && (
          <div className="rounded-2xl overflow-hidden border border-ice-border/15 mb-10 aspect-video">
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
        <div className="prose prose-invert prose-cyan prose-lg max-w-none leading-relaxed whitespace-pre-wrap mb-10"
          style={{ fontSize: '1.125rem', lineHeight: '1.9' }}>
          <ArticleContent content={article.content ?? ""} />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-10 pt-6 border-t border-ice-border/15">
            <Tag className="h-4 w-4 text-muted-foreground/40" />
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 text-xs rounded-full bg-ice-card/10 border border-ice-border/15 text-muted-foreground hover:border-cyan-glow/30 transition">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Card */}
        {(article.profiles as any) && (
          <div className="p-6 rounded-2xl border border-ice-border/15 bg-ice-card/5 flex items-start gap-5 mb-10">
            {(article.profiles as any).avatar_url ? (
              <img src={(article.profiles as any).avatar_url} alt="" className="h-16 w-16 rounded-full shrink-0 ring-2 ring-cyan-glow/20" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-ice-card/20 flex items-center justify-center shrink-0"><User className="h-7 w-7" /></div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Link to={`/blog/author/${(article.profiles as any).username}` as any} className="font-bold text-lg hover:text-cyan-glow transition">
                  {(article.profiles as any).full_name ?? (article.profiles as any).username}
                </Link>
                <Link to={`/blog/author/${(article.profiles as any).username}` as any}>
                  <Button variant="outline" size="sm" className="border-cyan-glow/30 text-cyan-glow hover:bg-cyan-glow/10">
                    {isRTL ? "جميع المقالات" : "All Articles"}
                  </Button>
                </Link>
              </div>
              {(article.profiles as any).bio && (
                <p className="text-sm text-muted-foreground/60 mt-2">{(article.profiles as any).bio}</p>
              )}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentsSection articleId={article.id} isRTL={isRTL} />

        {/* Related Articles */}
        <RelatedArticles currentSlug={slug} categorySlug={(article.article_categories as any)?.slug} />
      </article>
    </PublicPageShell>
  );
}

function ArticleContent({ content }: { content: string }) {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-12 mb-5">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-ice-card/20 text-cyan-glow text-sm font-mono">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-cyan-glow/40 pl-4 italic text-muted-foreground/70 my-4 text-base">$1</blockquote>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-cyan-glow underline hover:text-cyan-glow/80 transition" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br/>');
  return <div dangerouslySetInnerHTML={{ __html: `<p class="mb-4">${html}</p>` }} />;
}

function SocialActions({ article, isRTL }: { article: any; isRTL: boolean }) {
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
    <div className="flex items-center gap-3 mb-8 flex-wrap">
      <button onClick={() => toggle()} disabled={isPending}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
          liked ? "bg-red-500/15 border-red-500/30 text-red-400" : "border-ice-border/20 text-muted-foreground hover:border-red-500/30 hover:text-red-400"
        }`}>
        <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        {article.likes_count}
      </button>
      <button onClick={() => share('twitter')}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-ice-border/20 text-sm text-muted-foreground hover:border-cyan-glow/30 hover:text-cyan-glow transition">
        <Twitter className="h-4 w-4" />
      </button>
      <button onClick={() => share('facebook')}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-ice-border/20 text-sm text-muted-foreground hover:border-blue-500/30 hover:text-blue-400 transition">
        <Facebook className="h-4 w-4" />
      </button>
      <button onClick={copyLink}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-ice-border/20 text-sm text-muted-foreground hover:border-cyan-glow/30 hover:text-cyan-glow transition">
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
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-cyan-glow" />
        {isRTL ? "التعليقات" : "Comments"} ({comments.length})
      </h3>

      {user && (
        <div className="mb-6 p-4 rounded-2xl border border-ice-border/15 bg-ice-card/5">
          <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
            placeholder={isRTL ? "اكتب تعليقك..." : "Write a comment..."} rows={3}
            className="bg-transparent border-ice-border/15 mb-3" />
          <Button onClick={handleSubmit} disabled={addComment.isPending || !newComment.trim()} size="sm"
            className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
            {isRTL ? "إرسال" : "Post Comment"}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border border-ice-border/10 bg-ice-card/5">
            <div className="flex items-center gap-3 mb-2">
              {(c.profiles as any)?.avatar_url ? (
                <img src={(c.profiles as any).avatar_url} alt="" className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-ice-card/20 flex items-center justify-center"><User className="h-4 w-4" /></div>
              )}
              <div className="flex-1">
                <span className="text-sm font-semibold">{(c.profiles as any)?.full_name ?? (c.profiles as any)?.username}</span>
                <span className="text-[10px] text-muted-foreground/40 mr-2 ml-2">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              {user?.id === c.user_id && (
                <button onClick={() => deleteComment.mutate({ id: c.id, articleId })}
                  className="text-xs text-muted-foreground/40 hover:text-destructive transition">
                  {isRTL ? "حذف" : "Delete"}
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground/70 leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedArticles({ currentSlug, categorySlug }: { currentSlug: string; categorySlug?: string }) {
  const { data: articles = [] } = usePublishedArticles({ limit: 4 });
  const related = articles.filter(a => a.slug !== currentSlug).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <FileText className="h-5 w-5 text-violet-glow" />
        Related Articles
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {related.map((a) => (
          <Link key={a.id} to={`/blog/${a.slug}` as any} className="group block">
            <article className="rounded-2xl overflow-hidden border border-ice-border/15 bg-ice-card/5 hover:border-cyan-glow/30 transition-all duration-500">
              <div className="relative h-36 overflow-hidden">
                {a.featured_image ? (
                  <img src={a.featured_image} alt={a.title} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-sm line-clamp-2 group-hover:text-cyan-glow transition-colors">{a.title}</h4>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/40">
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
