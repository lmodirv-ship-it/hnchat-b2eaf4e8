import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { fetchPublicPost } from "@/utils/public-pages.functions";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

          <InteractionPanel
            postId={post.id}
            initialLikes={post.likes_count}
            initialComments={post.comments_count}
            views={post.views_count}
          />
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
              image: (post.media_urls || []).find((u: string) => /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i.test(u) && !/youtube|youtu\.be|vimeo/i.test(u)) || post.author?.avatar_url || undefined,
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

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author?: { username: string | null; full_name: string | null; avatar_url: string | null } | null;
};

function InteractionPanel({
  postId,
  initialLikes,
  initialComments,
  views,
}: {
  postId: string;
  initialLikes: number;
  initialComments: number;
  views: number;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [likes, setLikes] = useState(initialLikes);
  const [commentsCount, setCommentsCount] = useState(initialComments);
  const [liked, setLiked] = useState(false);
  const [busyLike, setBusyLike] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Ensure a session (sign in anonymously if needed)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        if (!cancelled) setUserId(session.user.id);
        return;
      }
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn("anon sign-in failed", error.message);
        return;
      }
      if (!cancelled && data.user) setUserId(data.user.id);
    })();
    return () => { cancelled = true; };
  }, []);

  // Check if liked when userId ready
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [userId, postId]);

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, created_at, user_id, author:profiles!fk_comments_user(username, full_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.warn("load comments failed", error.message);
      return;
    }
    setComments((data as any) || []);
  }, [postId]);

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments, loadComments]);

  async function toggleLike() {
    if (!userId || busyLike) return;
    setBusyLike(true);
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      if (next) {
        const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: userId });
        if (error && !/duplicate/i.test(error.message)) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
        if (error) throw error;
      }
    } catch (e: any) {
      // revert
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
      toast.error(e?.message || "تعذر تنفيذ التفاعل");
    } finally {
      setBusyLike(false);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || sending) return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({ post_id: postId, user_id: userId, content: text })
        .select("id, content, created_at, user_id, author:profiles!fk_comments_user(username, full_name, avatar_url)")
        .single();
      if (error) throw error;
      setComments((prev) => [data as any, ...prev]);
      setCommentsCount((n) => n + 1);
      setDraft("");
      setShowComments(true);
      toast.success("تم نشر التعليق");
    } catch (e: any) {
      toast.error(e?.message || "تعذر نشر التعليق");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 pt-3 border-t border-border text-sm">
        <button
          onClick={toggleLike}
          disabled={!userId || busyLike}
          className={`flex items-center gap-1.5 transition ${liked ? "text-pink-500" : "text-muted-foreground hover:text-pink-500"}`}
          aria-label="إعجاب"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          <span>{likes}</span>
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition"
          aria-label="تعليقات"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{commentsCount}</span>
        </button>
        <span className="flex items-center gap-1.5 text-muted-foreground ms-auto">👁️ {views}</span>
      </div>

      <form onSubmit={submitComment} className="pt-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={userId ? "اكتب تعليقاً..." : "جاري التحضير..."}
          disabled={!userId || sending}
          maxLength={500}
          className="flex-1 px-3 py-2 rounded-md bg-muted/50 border border-border text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!userId || sending || !draft.trim()}
          className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm flex items-center gap-1 disabled:opacity-60"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          نشر
        </button>
      </form>

      {showComments && (
        <div className="pt-3 border-t border-border space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
          ) : (
            comments.map((c) => {
              const name = c.author?.full_name || c.author?.username || "زائر";
              return (
                <div key={c.id} className="flex gap-2">
                  {c.author?.avatar_url ? (
                    <img src={c.author.avatar_url} alt={name} className="w-8 h-8 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold">{name}</p>
                    <p className="text-sm whitespace-pre-wrap mt-0.5">{c.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </>
  );
}
