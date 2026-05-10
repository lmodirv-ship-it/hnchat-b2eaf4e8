import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { fetchPublicPost } from "@/utils/public-pages.functions";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";

const SITE_URL = "https://www.hnchat.net";

type PublicPost = {
  id: string;
  content: string | null;
  media_urls: string[];
  type: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  author: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const Route = createFileRoute("/post/$id")({
  loader: async ({ params }) => {
    const post = await fetchPublicPost({ data: { id: params.id } });
    if (!post) throw notFound();
    return post as PublicPost;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "منشور — HN Chat" },
          { name: "description", content: "تصفّح المنشورات على HN Chat" },
        ],
      };
    }
    const authorName =
      loaderData.author?.full_name || loaderData.author?.username || "مستخدم";
    const rawContent = (loaderData.content || "").trim();
    const snippet = rawContent
      ? rawContent.length > 150
        ? rawContent.slice(0, 150) + "…"
        : rawContent
      : `منشور من ${authorName} على HN Chat`;
    const title = rawContent
      ? `${rawContent.slice(0, 60)}${rawContent.length > 60 ? "…" : ""} — ${authorName}`
      : `منشور ${authorName} — HN Chat`;
    // Only accept real image URLs for og:image (skip youtube/video/non-image links)
    const isImageUrl = (u?: string) =>
      !!u &&
      /^https?:\/\//i.test(u) &&
      /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(u) &&
      !/youtube\.com|youtu\.be|vimeo\.com/i.test(u);
    const firstImage = (loaderData.media_urls || []).find(isImageUrl);
    const image = firstImage || loaderData.author?.avatar_url || undefined;
    const url = `${SITE_URL}/post/${loaderData.id}`;

    const meta = [
      { title },
      { name: "description", content: snippet },
      { property: "og:title", content: title },
      { property: "og:description", content: snippet },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: snippet },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PublicPostPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">حدث خطأ</h1>
          <p className="text-muted-foreground">{error.message}</p>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  },
  notFoundComponent: () => {
    const { id } = Route.useParams();
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-3xl font-bold">المنشور غير موجود</h1>
          <p className="text-muted-foreground">
            لم نعثر على المنشور المطلوب ({id}).
          </p>
          <Link to="/" className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  },
});

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function PublicPostPage() {
  const post = Route.useLoaderData();
  const authorName =
    post.author?.full_name || post.author?.username || "مستخدم";
  const username = post.author?.username;

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            HN Chat
          </Link>
          <Link
            to="/sign-up-login"
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm"
          >
            تسجيل الدخول
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <article className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={authorName}
                className="w-12 h-12 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                {authorName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-semibold text-base leading-tight">{authorName}</h1>
              {username && (
                <p className="text-sm text-muted-foreground">@{username}</p>
              )}
              <time className="text-xs text-muted-foreground" dateTime={post.created_at}>
                {formatDate(post.created_at)}
              </time>
            </div>
          </div>

          {post.content && (
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
              {post.content}
            </p>
          )}

          {post.media_urls.length > 0 && (
            <div className="grid gap-2 grid-cols-1">
              {post.media_urls.slice(0, 4).map((url: string, i: number) => (
                <img
                  key={i}
                  src={url}
                  alt={`مرفق ${i + 1}`}
                  className="w-full rounded-md border border-border object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 pt-3 border-t border-border text-sm text-muted-foreground">
            <span>❤️ {post.likes_count}</span>
            <span>💬 {post.comments_count}</span>
            <span>👁️ {post.views_count}</span>
          </div>

          <div className="pt-3 border-t border-border">
            <Link
              to="/sign-up-login"
              className="block w-full text-center px-4 py-2 rounded-md bg-primary text-primary-foreground"
            >
              سجّل الدخول للتفاعل مع المنشور
            </Link>
          </div>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SocialMediaPosting",
              headline:
                (post.content || `منشور ${authorName}`).slice(0, 110),
              datePublished: post.created_at,
              author: { "@type": "Person", name: authorName },
              url: `${SITE_URL}/post/${post.id}`,
              image: (post.media_urls || []).find((u) => /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(u) && !/youtube|youtu\.be|vimeo/i.test(u)) || post.author?.avatar_url || undefined,
              interactionStatistic: [
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/LikeAction",
                  userInteractionCount: post.likes_count,
                },
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/CommentAction",
                  userInteractionCount: post.comments_count,
                },
              ],
            }).replace(/<\/script>/gi, "<\\/script>"),
          }}
        />

        {/* Ad Unit */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <AdSenseUnit className="rounded-xl overflow-hidden" />
        </div>
      </main>
    </div>
  );
}
