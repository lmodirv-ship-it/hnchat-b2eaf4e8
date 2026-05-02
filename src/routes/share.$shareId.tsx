import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchSharedChat } from "@/server/shared-chats.functions";
import { Sparkles, User as UserIcon, ArrowLeft } from "lucide-react";

const SITE_URL = "https://www.hn-chat.com";

export const Route = createFileRoute("/share/$shareId")({
  loader: async ({ params }) => {
    const chat = await fetchSharedChat({ data: { shareId: params.shareId } });
    return { chat };
  },
  head: ({ loaderData }) => {
    const chat = loaderData?.chat;
    const title = chat ? `${chat.title} — HN-Chat AI` : "محادثة غير موجودة — HN-Chat";
    const desc = chat
      ? `شاهد هذه المحادثة مع الذكاء الاصطناعي على HN-Chat: ${(chat.messages[0]?.content ?? "").slice(0, 120)}`
      : "محادثة AI على HN-Chat";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE_URL}/share/${chat?.share_id ?? ""}` },
        { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/share/${chat?.share_id ?? ""}` }],
    };
  },
  component: SharedChatPage,
});

function SharedChatPage() {
  const { chat } = Route.useLoaderData();

  if (!chat) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">محادثة غير موجودة</h1>
          <p className="text-muted-foreground">قد تكون المحادثة حُذفت أو الرابط غير صحيح.</p>
          <Link to="/" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-primary hover:text-primary/80">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-bold text-sm">{chat.title}</h1>
              <p className="text-[10px] text-muted-foreground">
                بواسطة @{chat.author?.username ?? "مجهول"} · {new Date(chat.created_at).toLocaleDateString("ar")}
              </p>
            </div>
          </div>
          <Link to="/sign-up-login" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs">
            جرّب HN-Chat AI
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {chat.messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
              m.role === "user"
                ? "bg-cyan-glow/20 text-cyan-glow border-cyan-glow/40"
                : "bg-violet-glow/20 text-violet-glow border-violet-glow/40"
            }`}>
              {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap border ${
              m.role === "user"
                ? "bg-cyan-glow/10 border-cyan-glow/30"
                : "bg-muted/30 border-border"
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-cyan-glow/10 to-violet-glow/10 border border-cyan-glow/20 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-violet-glow mb-3" />
          <h2 className="font-bold mb-2">جرّب HN-Chat AI مجاناً</h2>
          <p className="text-sm text-muted-foreground mb-4">دردش مع الذكاء الاصطناعي، شارك محادثاتك، واكتشف عالماً من الإمكانيات</p>
          <Link to="/sign-up-login" className="inline-block px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium">
            ابدأ الآن
          </Link>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: chat.title,
            author: { "@type": "Person", name: chat.author?.username ?? "HN-Chat User" },
            datePublished: chat.created_at,
            publisher: { "@type": "Organization", name: "HN-Chat", url: SITE_URL },
          }),
        }}
      />
    </div>
  );
}
