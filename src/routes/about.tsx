import { createFileRoute, Link } from "@tanstack/react-router";

const SITE_URL = "https://www.hnchat.net";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن HN Chat — منصة التواصل الاجتماعي العربية" },
      {
        name: "description",
        content:
          "HN Chat منصة تواصل اجتماعي عربية شاملة تجمع بين المنشورات، البث المباشر، الفيديوهات، المتجر، والمجموعات في مكان واحد.",
      },
      { property: "og:title", content: "عن HN Chat" },
      {
        property: "og:description",
        content: "تعرّف على منصة HN Chat — التواصل الاجتماعي العربي المتكامل.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
  component: AboutPage,
});

function AboutPage() {
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

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <section>
          <h1 className="text-4xl font-bold mb-4">عن HN Chat</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            HN Chat منصة تواصل اجتماعي عربية متكاملة، مصمّمة لتجمع كل ما تحتاجه
            في تجربة واحدة سلسة وسريعة.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">رؤيتنا</h2>
          <p className="leading-relaxed">
            نسعى لبناء مجتمع رقمي عربي حيوي، يربط المستخدمين والمبدعين والتجار
            في فضاء آمن، حديث، وغني بالميزات.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">ما الذي يميّزنا؟</h2>
          <ul className="space-y-2 list-disc pr-6">
            <li>منشورات وقصص ومحتوى تفاعلي</li>
            <li>بث مباشر وغرف صوتية</li>
            <li>فيديوهات قصيرة وطويلة</li>
            <li>متجر إلكتروني ومنطقة تجارة</li>
            <li>مجموعات ومجتمعات حسب الاهتمام</li>
            <li>مساعد ذكاء اصطناعي مدمج</li>
            <li>رسائل خاصة وبريد داخلي</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">انضم إلينا</h2>
          <p className="leading-relaxed mb-4">
            ابدأ رحلتك معنا اليوم، وكُن جزءاً من مجتمع متنامٍ.
          </p>
          <Link to="/sign-up-login" className="inline-block px-5 py-2.5 rounded-md bg-primary text-primary-foreground">
            إنشاء حساب
          </Link>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              name: "عن HN Chat",
              url: `${SITE_URL}/about`,
              mainEntity: {
                "@type": "Organization",
                name: "HN Chat",
                url: SITE_URL,
                description: "منصة تواصل اجتماعي عربية متكاملة",
              },
            }),
          }}
        />
      </main>
    </div>
  );
}
