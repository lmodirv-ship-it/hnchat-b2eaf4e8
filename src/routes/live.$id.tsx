import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { fetchPublicStream } from "@/server/public-pages.functions";

const SITE_URL = "https://www.hnchat.net";

type PublicStream = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: string;
  viewer_count: number;
  peak_viewers: number;
  category: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  author: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const Route = createFileRoute("/live/$id")({
  loader: async ({ params }) => {
    const stream = await fetchPublicStream({ data: { id: params.id } });
    if (!stream) throw notFound();
    return stream as PublicStream;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "بث مباشر — HN Chat" }] };
    }
    const authorName =
      loaderData.author?.full_name || loaderData.author?.username || "مستخدم";
    const title = `${loaderData.title} — بث مباشر من ${authorName}`;
    const description =
      loaderData.description ||
      `شاهد البث المباشر "${loaderData.title}" على HN Chat`;
    const url = `${SITE_URL}/live/${loaderData.id}`;
    const image = loaderData.thumbnail_url;

    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "video.other" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    return { meta, links: [{ rel: "canonical", href: url }] };
  },
  component: PublicLivePage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">حدث خطأ</h1>
          <p className="text-muted-foreground">{error.message}</p>
          <button
            onClick={() => { router.invalidate(); reset(); }}
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
          <h1 className="text-3xl font-bold">البث غير موجود</h1>
          <p className="text-muted-foreground">لم نعثر على البث ({id}).</p>
          <Link to="/" className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  },
});

function PublicLivePage() {
  const stream = Route.useLoaderData();
  const authorName =
    stream.author?.full_name || stream.author?.username || "مستخدم";

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">HN Chat</Link>
          <Link to="/sign-up-login" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm">
            تسجيل الدخول
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {stream.thumbnail_url && (
          <img
            src={stream.thumbnail_url}
            alt={stream.title}
            className="w-full aspect-video object-cover rounded-lg border border-border"
            loading="eager"
          />
        )}

        <article className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold leading-tight">{stream.title}</h1>
            <span className={`text-xs px-2 py-1 rounded-full ${stream.status === "live" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"}`}>
              {stream.status === "live" ? "🔴 مباشر" : stream.status === "ended" ? "انتهى" : "مجدول"}
            </span>
          </div>

          <div className="flex items-center gap-3 pb-3 border-b border-border">
            {stream.author?.avatar_url ? (
              <img src={stream.author.avatar_url} alt={authorName} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                {authorName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold">{authorName}</p>
              {stream.author?.username && (
                <p className="text-sm text-muted-foreground">@{stream.author.username}</p>
              )}
            </div>
          </div>

          {stream.description && (
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
              {stream.description}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>👁️ {stream.viewer_count} مشاهد</span>
            <span>📈 ذروة: {stream.peak_viewers}</span>
            {stream.category && <span>🏷️ {stream.category}</span>}
          </div>

          <Link to="/sign-up-login" className="block w-full text-center px-4 py-2 rounded-md bg-primary text-primary-foreground">
            سجّل الدخول لمشاهدة البث
          </Link>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoObject",
              name: stream.title,
              description: stream.description || stream.title,
              thumbnailUrl: stream.thumbnail_url || undefined,
              uploadDate: stream.created_at,
              ...(stream.started_at && { startDate: stream.started_at }),
              ...(stream.ended_at && { endDate: stream.ended_at }),
              publication: {
                "@type": "BroadcastEvent",
                isLiveBroadcast: stream.status === "live",
                ...(stream.started_at && { startDate: stream.started_at }),
                ...(stream.ended_at && { endDate: stream.ended_at }),
              },
              author: { "@type": "Person", name: authorName },
              url: `${SITE_URL}/live/${stream.id}`,
              interactionStatistic: {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/WatchAction",
                userInteractionCount: stream.peak_viewers,
              },
            }).replace(/<\/script>/gi, "<\\/script>"),
          }}
        />
      </main>
    </div>
  );
}
