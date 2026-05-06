import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

const SITE_URL = "https://www.hn-chat.com";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن HN-Chat — منصة دردشة ذكاء اصطناعي وتواصل اجتماعي عربي" },
      { name: "description", content: "HN-Chat منصة عربية شاملة تجمع بين دردشة الذكاء الاصطناعي، بوتات الدردشة الذكية، المنشورات، البث المباشر، الفيديوهات، والمتجر في مكان واحد." },
      { property: "og:title", content: "عن HN-Chat — دردشة ذكاء اصطناعي وتواصل اجتماعي" },
      { property: "og:description", content: "تعرّف على منصة HN-Chat — أفضل منصة دردشة AI عربية وتواصل اجتماعي متكامل." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicPageShell>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <section>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
            عن HN Chat
          </h1>
          <p className="text-lg text-muted-foreground/80 leading-relaxed">
            HN Chat منصة تواصل اجتماعي عربية متكاملة، مصمّمة لتجمع كل ما تحتاجه
            في تجربة واحدة سلسة وسريعة.
          </p>
        </section>

        <section className="rounded-2xl border border-ice-border/15 bg-ice-card/10 backdrop-blur-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-3 text-foreground">رؤيتنا</h2>
          <p className="leading-relaxed text-muted-foreground/70">
            نسعى لبناء مجتمع رقمي عربي حيوي، يربط المستخدمين والمبدعين والتجار
            في فضاء آمن، حديث، وغني بالميزات.
          </p>
        </section>

        <section className="rounded-2xl border border-ice-border/15 bg-ice-card/10 backdrop-blur-xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground">ما الذي يميّزنا؟</h2>
          <ul className="space-y-3 list-none">
            {[
              "منشورات وقصص ومحتوى تفاعلي",
              "بث مباشر وغرف صوتية",
              "فيديوهات قصيرة وطويلة",
              "متجر إلكتروني ومنطقة تجارة",
              "مجموعات ومجتمعات حسب الاهتمام",
              "مساعد ذكاء اصطناعي مدمج",
              "رسائل خاصة وبريد داخلي",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-muted-foreground/80">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-cyan-glow/20 bg-gradient-to-br from-cyan-glow/5 to-violet-glow/5 backdrop-blur-xl p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">انضم إلينا</h2>
          <p className="leading-relaxed mb-5 text-muted-foreground/70">
            ابدأ رحلتك معنا اليوم، وكُن جزءاً من مجتمع متنامٍ.
          </p>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              name: "عن HN Chat",
              url: `${SITE_URL}/about`,
              mainEntity: { "@type": "Organization", name: "HN Chat", url: SITE_URL, description: "منصة تواصل اجتماعي عربية متكاملة" },
            }),
          }}
        />
      </div>
    </PublicPageShell>
  );
}
