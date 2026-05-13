import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  useArticleByIdFull,
  useArticleComments,
  useAddArticleComment,
  useDeleteArticleComment,
  useArticleLike,
  usePublishedArticles,
} from "@/hooks/useBlog";
import { useAuth } from "@/lib/auth";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  Eye,
  User,
  ArrowLeft,
  Tag,
  Heart,
  MessageCircle,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Send,
  Mail,
  Link2,
  Copy,
  FileText,
  Bookmark,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";
import { fetchPublicArticle } from "@/utils/public-pages.functions";

const SITE_URL = "https://www.hn-chat.com";
const ORG_NAME = "hnChat";
const ORG_LOGO = `${SITE_URL}/icon-512.png`;

const truncate = (s: string, n: number) =>
  !s ? "" : s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";

const stripMd = (s: string) =>
  (s || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const Route = createFileRoute("/blog/$articleId")({
  loader: async ({ params }) => {
    const article = await fetchPublicArticle({ data: { id: params.articleId } });
    return { article };
  },
  head: ({ loaderData, params }) => {
    const a: any = (loaderData as any)?.article;
    if (!a) {
      return {
        meta: [
          { title: "مقال — مدونة hnChat" },
          { name: "description", content: "تابع أحدث المقالات على مدونة hnChat حول الذكاء الاصطناعي والتقنية." },
          { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        ],
      };
    }

    const id = a.short_id ?? params.articleId;
    const url = `${SITE_URL}/blog/${id}`;
    const title = truncate(a.seo_title || a.title, 65);
    const description = truncate(
      a.seo_description || a.short_description || stripMd(a.content || ""),
      158,
    );
    const image = a.featured_image || `${SITE_URL}/og-default.png`;
    const isAr = a.language !== "en";
    const author = a.author?.full_name || a.author?.username || "hnChat";
    const tags: string[] = Array.isArray(a.tags) ? a.tags : [];
    const keywords = tags.join(", ");
    const published = a.published_at || a.updated_at;
    const modified = a.updated_at || a.published_at;

    const blogPosting = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: title,
      description,
      image: [image],
      author: {
        "@type": "Person",
        name: author,
        url: a.author?.username ? `${SITE_URL}/blog/author/${a.author.username}` : undefined,
      },
      publisher: {
        "@type": "Organization",
        name: ORG_NAME,
        logo: { "@type": "ImageObject", url: ORG_LOGO },
      },
      datePublished: published,
      dateModified: modified,
      inLanguage: a.language || "ar",
      keywords,
      articleSection: a.category?.name_ar || a.category?.name || undefined,
      wordCount: stripMd(a.content || "").split(/\s+/).filter(Boolean).length,
    };

    const breadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: isAr ? "المدونة" : "Blog", item: `${SITE_URL}/blog` },
        ...(a.category
          ? [{ "@type": "ListItem", position: 3, name: isAr ? a.category.name_ar : a.category.name, item: `${SITE_URL}/blog?cat=${a.category.slug}` }]
          : []),
        { "@type": "ListItem", position: a.category ? 4 : 3, name: title, item: url },
      ],
    };

    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: ORG_NAME,
      url: SITE_URL,
      logo: ORG_LOGO,
      sameAs: ["https://twitter.com/hnchat"],
    };

    return {
      meta: [
        { title: `${title} — ${ORG_NAME}` },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { name: "author", content: author },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:site_name", content: ORG_NAME },
        { property: "og:locale", content: isAr ? "ar_AR" : "en_US" },
        { property: "article:published_time", content: published },
        { property: "article:modified_time", content: modified },
        { property: "article:author", content: author },
        ...(a.category ? [{ property: "article:section", content: a.category.name_ar || a.category.name }] : []),
        ...tags.map((t) => ({ property: "article:tag", content: t })),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(blogPosting) },
        { type: "application/ld+json", children: JSON.stringify(breadcrumbs) },
        { type: "application/ld+json", children: JSON.stringify(organization) },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { articleId } = Route.useParams();
  const { data: article, isLoading, error } = useArticleByIdFull(articleId);

  if (isLoading) {
    return (
      <PublicPageShell dir="rtl">
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
      <PublicPageShell dir="rtl">
        <div className="text-center py-24">
          <FileText className="h-14 w-14 text-muted-foreground/15 mx-auto mb-5" />
          <h1 className="text-2xl font-bold mb-3">المقال غير موجود</h1>
          <Link
            to="/feed"
            hash="articles-section"
            className="text-cyan-glow hover:underline underline-offset-4"
          >
            → العودة للمقالات
          </Link>
        </div>
      </PublicPageShell>
    );
  }

  const isRTL = article.language !== "en";

  const gradientStyle = { background: "linear-gradient(135deg, oklch(0.65 0.25 295) 0%, oklch(0.55 0.20 270) 50%, oklch(0.78 0.18 220) 100%)" };
  const btnClass = "px-5 py-2 text-xs font-semibold rounded-full text-white transition-all hover:shadow-[0_0_20px_oklch(0.65_0.25_295/0.4)] hover:scale-105";

  const headerButtons = (
    <>
      <Link to="/feed" hash="articles-section" className={btnClass} style={gradientStyle}>
        {isRTL ? "المقالات" : "Feed"}
      </Link>
      <Link to="/blog" className={btnClass} style={gradientStyle}>
        {isRTL ? "المدونة" : "Blog"}
      </Link>
    </>
  );

  return (
    <PublicPageShell dir={isRTL ? "rtl" : "ltr"} headerActions={headerButtons}>
      {/* Hero Cover — full width, uncropped */}
      {article.featured_image && (
        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-8 mt-8">
          <div className="rounded-3xl overflow-hidden border border-ice-border/10 bg-[oklch(0.10_0.02_250)] shadow-[0_20px_80px_oklch(0_0_0/0.4)]">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-auto max-h-[620px] object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Article Body — wide magazine layout */}
      <div className="max-w-[820px] mx-auto px-5 sm:px-8">
        <article className="mt-10 relative z-10">

          {/* Breadcrumbs (visible) */}
          <nav aria-label="breadcrumb" className="mb-5 text-xs text-muted-foreground/55 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-cyan-glow transition">{isRTL ? "الرئيسية" : "Home"}</Link>
            <ChevronLeft className="h-3 w-3 opacity-40" />
            <Link to="/blog" className="hover:text-cyan-glow transition">{isRTL ? "المدونة" : "Blog"}</Link>
            {(article.article_categories as any) && (
              <>
                <ChevronLeft className="h-3 w-3 opacity-40" />
                <span className="text-muted-foreground/70">
                  {isRTL ? (article.article_categories as any).name_ar : (article.article_categories as any).name}
                </span>
              </>
            )}
            <ChevronLeft className="h-3 w-3 opacity-40" />
            <span className="text-foreground/80 line-clamp-1">{article.title}</span>
          </nav>

          {/* Category */}
          {(article.article_categories as any) && (
            <span className="inline-block px-4 py-1.5 text-[11px] font-bold rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow text-white mb-6 tracking-wider uppercase">
              {isRTL
                ? (article.article_categories as any).name_ar
                : (article.article_categories as any).name}
            </span>
          )}

          {/* Title — large, editorial */}
          <h1 className="text-3xl sm:text-[2.75rem] lg:text-[3.25rem] font-extrabold mb-8 leading-[1.15] tracking-tight">
            {article.title}
          </h1>

          {/* Short description */}
          {article.short_description && (
            <p className="text-lg sm:text-xl text-muted-foreground/55 leading-relaxed mb-8 font-medium">
              {article.short_description}
            </p>
          )}

          {/* Author & Meta — premium card */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground/50 mb-10 pb-8 border-b border-ice-border/10">
            <Link
              to="/blog/author/$username"
              params={{ username: (article.profiles as any)?.username ?? "" }}
              className="flex items-center gap-3 hover:text-cyan-glow transition"
            >
              {(article.profiles as any)?.avatar_url ? (
                <img
                  src={(article.profiles as any).avatar_url}
                  alt=""
                  className="h-12 w-12 rounded-full ring-2 ring-cyan-glow/15"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[oklch(0.20_0.04_250)] to-[oklch(0.16_0.02_250)] flex items-center justify-center ring-2 ring-ice-border/15">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div>
                <span className="font-bold text-foreground/85 block text-base">
                  {(article.profiles as any)?.full_name ?? (article.profiles as any)?.username}
                </span>
                <span className="text-xs text-muted-foreground/40">
                  @{(article.profiles as any)?.username}
                </span>
              </div>
            </Link>
            <div className="h-8 w-px bg-ice-border/10 hidden sm:block" />
            <div className="flex items-center gap-5 text-xs text-muted-foreground/45">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {article.published_at
                  ? new Date(article.published_at).toLocaleDateString(isRTL ? "ar" : "en", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {article.reading_time} {isRTL ? "دقائق" : "min read"}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {article.views_count}
              </span>
            </div>
          </div>

          {/* Sticky Social Bar */}
          <StickyShareBar article={article} isRTL={isRTL} />

          {/* Video */}
          {article.video_url && (
            <div className="rounded-2xl overflow-hidden border border-ice-border/10 mb-10 aspect-video bg-[oklch(0.12_0.02_250)]">
              {article.video_url.includes("youtube") || article.video_url.includes("youtu.be") ? (
                <iframe
                  src={article.video_url
                    .replace("watch?v=", "embed/")
                    .replace("youtu.be/", "youtube.com/embed/")}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <video src={article.video_url} controls className="w-full h-full" />
              )}
            </div>
          )}

          {/* Ad before content */}
          <div className="mb-10">
            <AdSenseUnit className="rounded-xl overflow-hidden" />
          </div>

          {/* Content — magazine typography */}
          <div
            className="mb-14"
            style={{ fontSize: "1.15rem", lineHeight: "1.9", letterSpacing: "0.005em" }}
          >
            <ArticleContent content={article.content ?? ""} />
          </div>

          {/* Ad after content */}
          <div className="mb-10">
            <AdSenseUnit className="rounded-xl overflow-hidden" />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 mb-12 pt-8 border-t border-ice-border/10">
              <Tag className="h-4 w-4 text-muted-foreground/30" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 text-xs rounded-full bg-[oklch(0.14_0.02_250)] border border-ice-border/10 text-muted-foreground/60 hover:border-cyan-glow/25 hover:text-cyan-glow transition"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Bio Card */}
          {(article.profiles as any) && (
            <div className="p-7 rounded-2xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)] flex items-start gap-5 mb-12">
              {(article.profiles as any).avatar_url ? (
                <img
                  src={(article.profiles as any).avatar_url}
                  alt=""
                  className="h-16 w-16 rounded-full shrink-0 ring-2 ring-cyan-glow/15"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-[oklch(0.18_0.02_250)] flex items-center justify-center shrink-0">
                  <User className="h-7 w-7" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    to="/blog/author/$username"
                    params={{ username: (article.profiles as any)?.username ?? "" }}
                    className="font-bold text-lg hover:text-cyan-glow transition"
                  >
                    {(article.profiles as any).full_name ?? (article.profiles as any).username}
                  </Link>
                  <Link
                    to="/blog/author/$username"
                    params={{ username: (article.profiles as any)?.username ?? "" }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-glow/20 text-cyan-glow hover:bg-cyan-glow/10 text-xs"
                    >
                      {isRTL ? "جميع المقالات" : "All Articles"} →
                    </Button>
                  </Link>
                </div>
                {(article.profiles as any).bio && (
                  <p className="text-sm text-muted-foreground/50 leading-relaxed">
                    {(article.profiles as any).bio}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Comments */}
          <CommentsSection articleId={article.id} isRTL={isRTL} />

          {/* Related */}
          <RelatedArticles currentSlug={article?.slug || ""} />
        </article>
      </div>
    </PublicPageShell>
  );
}

function ArticleContent({ content }: { content: string }) {
  const [sanitizedHtml, setSanitizedHtml] = useState("");

  useEffect(() => {
    import("dompurify").then((mod) => {
      const DOMPurify = mod.default;
      const cleaned = content
        .replace(/^\s*\.{2,}\s*$/gm, "")
        .replace(/^\s*…+\s*$/gm, "")
        .replace(/\n{3,}/g, "\n\n");

      const raw = cleaned
        .replace(
          /^### (.+)$/gm,
          '<h3 class="text-xl font-bold mt-8 mb-3" style="color:oklch(0.82 0.08 70)">$1</h3>',
        )
        .replace(
          /^## (.+)$/gm,
          '<h2 class="text-2xl font-bold mt-9 mb-3" style="color:oklch(0.85 0.09 65)">$1</h2>',
        )
        .replace(
          /^# (.+)$/gm,
          '<h1 class="text-3xl font-extrabold mt-10 mb-4" style="color:oklch(0.88 0.10 65)">$1</h1>',
        )
        .replace(
          /\*\*(.+?)\*\*/g,
          '<strong style="color:oklch(0.93 0.005 250);font-weight:600">$1</strong>',
        )
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(
          /```([\s\S]*?)```/gm,
          '<pre class="p-5 rounded-xl overflow-x-auto my-6" style="background:oklch(0.11 0.02 255);border:1px solid oklch(0.3 0.03 255/0.15)"><code class="text-sm font-mono leading-relaxed" style="color:oklch(0.80 0.005 250)">$1</code></pre>',
        )
        .replace(
          /`(.+?)`/g,
          '<code class="px-1.5 py-0.5 rounded-md text-[0.9em] font-mono" style="background:oklch(0.16 0.02 255);color:oklch(0.82 0.005 250);border:1px solid oklch(0.3 0.03 255/0.12)">$1</code>',
        )
        .replace(
          /^> (.+)$/gm,
          '<blockquote class="pl-5 italic my-5 text-base leading-relaxed" style="border-left:3px solid oklch(0.75 0.08 65/0.4);color:oklch(0.75 0.005 250)">$1</blockquote>',
        )
        .replace(/\[(.+?)\]\((.+?)\)/g, (_, text, url) => {
          if (/^https?:\/\//i.test(url)) {
            return `<a href="${url}" class="underline underline-offset-4 transition" style="color:oklch(0.70 0.08 220);text-decoration-color:oklch(0.70 0.08 220/0.3)" target="_blank" rel="noopener">${text}</a>`;
          }
          return text;
        })
        .replace(
          /^- (.+)$/gm,
          '<li class="ml-5 list-disc mb-1.5" style="color:oklch(0.85 0.005 250)">$1</li>',
        )
        .replace(
          /^\d+\. (.+)$/gm,
          '<li class="ml-5 list-decimal mb-1.5" style="color:oklch(0.85 0.005 250)">$1</li>',
        )
        .replace(/\n\n/g, '</p><p class="mb-4 leading-[1.85]" style="color:oklch(0.88 0.005 250)">')
        .replace(/\n/g, "<br/>");

      const safe = DOMPurify.sanitize(`<p class="mb-4 leading-[1.85]">${raw}</p>`, {
        ALLOWED_TAGS: [
          "h1",
          "h2",
          "h3",
          "h4",
          "p",
          "br",
          "strong",
          "em",
          "a",
          "code",
          "pre",
          "blockquote",
          "li",
          "ul",
          "ol",
          "span",
        ],
        ALLOWED_ATTR: ["class", "style", "href", "target", "rel"],
        ALLOWED_URI_REGEXP: /^https?:\/\//i,
      });
      setSanitizedHtml(safe);
    });
  }, [content]);

  return (
    <div
      className="leading-[1.85]"
      style={{ color: "oklch(0.88 0.005 250)" }}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

function StickyShareBar({ article, isRTL }: { article: any; isRTL: boolean }) {
  const { liked, toggle, isPending } = useArticleLike(article.id);
  // Canonical URL ensures the shared link works across all domains
  const canonicalUrl = `${SITE_URL}/blog/${article.id}`;
  const url = typeof window !== "undefined" ? window.location.href : canonicalUrl;
  const shareUrl = canonicalUrl;

  const share = (platform: string) => {
    const text = encodeURIComponent(article.title);
    const u = encodeURIComponent(shareUrl);
    const desc = encodeURIComponent(article.excerpt || article.title);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      whatsapp: `https://wa.me/?text=${text}%20${u}`,
      telegram: `https://t.me/share/url?url=${u}&text=${text}`,
      reddit: `https://www.reddit.com/submit?url=${u}&title=${text}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${u}&description=${text}`,
      email: `mailto:?subject=${text}&body=${desc}%0A%0A${u}`,
    };
    if (urls[platform]) {
      if (platform === "email") {
        window.location.href = urls[platform];
      } else {
        window.open(urls[platform], "_blank", "width=600,height=500,noopener,noreferrer");
      }
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: article.title, text: article.excerpt || article.title, url: shareUrl });
      } catch {}
    } else {
      copyLink();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(isRTL ? "تم نسخ الرابط" : "Link copied!");
  };

  // Brand SVG icons
  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26L4.92 19.13l3.734-1.937zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
  );
  const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
  );
  const RedditIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/></svg>
  );
  const PinterestIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
  );

  const platforms = [
    { key: "twitter", icon: <Twitter className="h-4 w-4" />, color: "[oklch(0.6_0.15_210)]", label: "Twitter" },
    { key: "facebook", icon: <Facebook className="h-4 w-4" />, color: "blue-500", label: "Facebook" },
    { key: "linkedin", icon: <Linkedin className="h-4 w-4" />, color: "blue-600", label: "LinkedIn" },
    { key: "whatsapp", icon: <WhatsAppIcon />, color: "green-500", label: "WhatsApp" },
    { key: "telegram", icon: <TelegramIcon />, color: "sky-500", label: "Telegram" },
    { key: "reddit", icon: <RedditIcon />, color: "orange-500", label: "Reddit" },
    { key: "pinterest", icon: <PinterestIcon />, color: "red-600", label: "Pinterest" },
    { key: "email", icon: <Mail className="h-4 w-4" />, color: "amber-500", label: "Email" },
  ];

  return (
    <div className="flex items-center gap-2 mb-10 flex-wrap">
      <button
        onClick={() => toggle()}
        disabled={isPending}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${
          liked
            ? "bg-red-500/10 border-red-500/25 text-red-400"
            : "border-ice-border/15 text-muted-foreground/60 hover:border-red-500/25 hover:text-red-400"
        }`}
        aria-label={isRTL ? "إعجاب" : "Like"}
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        <span>{article.likes_count}</span>
      </button>

      {platforms.map((p) => (
        <button
          key={p.key}
          onClick={() => share(p.key)}
          title={isRTL ? `مشاركة على ${p.label}` : `Share on ${p.label}`}
          aria-label={`Share on ${p.label}`}
          className="flex items-center justify-center h-10 w-10 rounded-xl border border-ice-border/15 text-muted-foreground/70 hover:border-cyan-glow/40 hover:text-cyan-glow hover:bg-cyan-glow/5 transition-all duration-300"
        >
          {p.icon}
        </button>
      ))}

      <button
        onClick={nativeShare}
        title={isRTL ? "مشاركة" : "Share"}
        aria-label="Share"
        className="flex items-center justify-center h-10 w-10 rounded-xl border border-ice-border/15 text-muted-foreground/70 hover:border-violet-glow/40 hover:text-violet-glow transition-all duration-300"
      >
        <Share2 className="h-4 w-4" />
      </button>

      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-4 h-10 rounded-xl border border-ice-border/15 text-sm text-muted-foreground/70 hover:border-cyan-glow/40 hover:text-cyan-glow transition-all duration-300"
        title={isRTL ? "نسخ الرابط" : "Copy link"}
      >
        <Link2 className="h-4 w-4" />
        <span className="hidden sm:inline">{isRTL ? "نسخ" : "Copy"}</span>
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
        <div className="p-2 rounded-xl bg-cyan-glow/10">
          <MessageCircle className="h-4 w-4 text-cyan-glow" />
        </div>
        {isRTL ? "التعليقات" : "Comments"}{" "}
        <span className="text-muted-foreground/30 font-normal">({comments.length})</span>
      </h3>

      {user && (
        <div className="mb-8 p-5 rounded-2xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)]">
          <div className="flex items-start gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-[oklch(0.18_0.02_250)] flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isRTL ? "اكتب تعليقك..." : "Write a comment..."}
              rows={3}
              className="bg-transparent border-ice-border/10 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={addComment.isPending || !newComment.trim()}
              size="sm"
              className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground px-5"
            >
              {isRTL ? "إرسال" : "Post"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-xl border border-ice-border/8 bg-[oklch(0.14_0.02_250)]"
          >
            <div className="flex items-center gap-3 mb-3">
              {(c.profiles as any)?.avatar_url ? (
                <img src={(c.profiles as any).avatar_url} alt="" className="h-9 w-9 rounded-full" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-[oklch(0.18_0.02_250)] flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1">
                <span className="text-sm font-semibold">
                  {(c.profiles as any)?.full_name ?? (c.profiles as any)?.username}
                </span>
                <span className="text-[10px] text-muted-foreground/30 mr-3 ml-3">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              {user?.id === c.user_id && (
                <button
                  onClick={() => deleteComment.mutate({ id: c.id, articleId })}
                  className="text-[11px] text-muted-foreground/30 hover:text-destructive transition px-2 py-1 rounded-lg hover:bg-destructive/10"
                >
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
  const related = articles.filter((a) => a.slug !== currentSlug).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <div className="mb-16">
      <h3 className="text-xl font-bold mb-7 flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-violet-glow/10">
          <FileText className="h-4 w-4 text-violet-glow" />
        </div>
        مقالات ذات صلة
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {related.map((a) => (
          <Link key={a.id} to="/blog/$articleId" params={{ articleId: a.short_id ?? a.id }} className="group block">
            <article className="rounded-2xl overflow-hidden border border-ice-border/10 bg-[oklch(0.14_0.02_250)] hover:border-cyan-glow/20 transition-all duration-500">
              <div className="relative h-40 overflow-hidden">
                {a.featured_image ? (
                  <img
                    src={a.featured_image}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-glow/8 to-violet-glow/8" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.02_250)] to-transparent" />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-sm line-clamp-2 group-hover:text-cyan-glow transition-colors">
                  {a.title}
                </h4>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground/30">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {a.reading_time} دقائق
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {a.views_count}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
