import { createFileRoute, Link } from "@tanstack/react-router";

const SITE_URL = "https://www.hn-chat.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — HN-Chat | دعم ومساعدة" },
      {
        name: "description",
        content:
          "تواصل مع فريق HN-Chat للدعم الفني، الاقتراحات، الشراكات، أو الاستفسارات حول منصة الدردشة الذكية والتواصل الاجتماعي.",
      },
      { property: "og:title", content: "تواصل معنا — HN-Chat" },
      { property: "og:description", content: "فريق HN-Chat هنا للمساعدة — دعم فني، شراكات، واستفسارات." },
      { property: "og:url", content: `${SITE_URL}/contact` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: ContactPage,
});

function ContactPage() {
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
          <h1 className="text-4xl font-bold mb-3">تواصل معنا</h1>
          <p className="text-lg text-muted-foreground">نحن نحب أن نسمع منك.</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="border border-border rounded-lg p-5">
            <h2 className="font-semibold mb-2">الدعم العام</h2>
            <p className="text-sm text-muted-foreground mb-3">للمساعدة في استخدام المنصة أو حل المشاكل.</p>
            <a href="mailto:support@hnchat.net" className="text-primary underline">support@hnchat.net</a>
          </div>
          <div className="border border-border rounded-lg p-5">
            <h2 className="font-semibold mb-2">الشراكات والإعلانات</h2>
            <p className="text-sm text-muted-foreground mb-3">للتعاون التجاري والحملات الإعلانية.</p>
            <a href="mailto:business@hnchat.net" className="text-primary underline">business@hnchat.net</a>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ContactPage",
              name: "تواصل مع HN Chat",
              url: `${SITE_URL}/contact`,
            }),
          }}
        />
      </main>
    </div>
  );
}
