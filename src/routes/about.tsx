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
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <section className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow bg-clip-text text-transparent">
            عن HN Chat
          </h1>
          <p className="text-lg text-foreground/70 leading-relaxed max-w-xl mx-auto">
            HN Chat منصة تواصل اجتماعي عربية متكاملة، مصمّمة لتجمع كل ما تحتاجه
            في تجربة واحدة سلسة وسريعة.
          </p>
        </section>

        <section
          className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-violet-glow/15"
          style={{ background: "linear-gradient(135deg, oklch(0.18 0.08 290 / 0.6) 0%, oklch(0.14 0.06 270 / 0.4) 100%)" }}
        >
          <h2 className="text-2xl font-bold mb-3 text-cyan-glow">رؤيتنا</h2>
          <p className="leading-relaxed text-foreground/70">
            نسعى لبناء مجتمع رقمي عربي حيوي، يربط المستخدمين والمبدعين والتجار
            في فضاء آمن، حديث، وغني بالميزات.
          </p>
        </section>

        <section
          className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-cyan-glow/15"
          style={{ background: "linear-gradient(135deg, oklch(0.15 0.06 260 / 0.5) 0%, oklch(0.12 0.07 290 / 0.4) 100%)" }}
        >
          <h2 className="text-2xl font-bold mb-4 text-violet-glow">ما الذي يميّزنا؟</h2>
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
              <li key={item} className="flex items-center gap-3 text-foreground/80">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-glow to-cyan-glow flex-shrink-0 shadow-[0_0_8px_oklch(0.65_0.25_295/0.6)]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section
          className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-pink-glow/15 text-center"
          style={{ background: "linear-gradient(135deg, oklch(0.16 0.08 300 / 0.5) 0%, oklch(0.12 0.06 280 / 0.4) 100%)" }}
        >
          <h2 className="text-2xl font-bold mb-3 text-foreground">انضم إلينا</h2>
          <p className="leading-relaxed mb-5 text-foreground/60">
            ابدأ رحلتك معنا اليوم، وكُن جزءاً من مجتمع متنامٍ.
          </p>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org", "@type": "AboutPage", name: "عن HN Chat", url: `${SITE_URL}/about`,
              mainEntity: { "@type": "Organization", name: "HN Chat", url: SITE_URL, description: "منصة تواصل اجتماعي عربية متكاملة" },
            }),
          }}
        />
      </div>
    </PublicPageShell>
  );
}
