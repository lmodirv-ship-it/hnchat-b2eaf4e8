import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

const SITE_URL = "https://www.hn-chat.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — HN-Chat | دعم ومساعدة" },
      { name: "description", content: "تواصل مع فريق HN-Chat للدعم الفني، الاقتراحات، الشراكات، أو الاستفسارات حول منصة الدردشة الذكية والتواصل الاجتماعي." },
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
    <PublicPageShell>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <section>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
            تواصل معنا
          </h1>
          <p className="text-lg text-muted-foreground/80">نحن نحب أن نسمع منك.</p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-ice-border/15 bg-ice-card/10 backdrop-blur-xl p-6 hover:border-cyan-glow/30 transition-all duration-300">
            <h2 className="font-bold text-lg mb-2">الدعم العام</h2>
            <p className="text-sm text-muted-foreground/60 mb-4">للمساعدة في استخدام المنصة أو حل المشاكل.</p>
            <a href="mailto:support@hnchat.net" className="text-cyan-glow hover:underline text-sm font-medium">support@hnchat.net</a>
          </div>
          <div className="rounded-2xl border border-ice-border/15 bg-ice-card/10 backdrop-blur-xl p-6 hover:border-violet-glow/30 transition-all duration-300">
            <h2 className="font-bold text-lg mb-2">الشراكات والإعلانات</h2>
            <p className="text-sm text-muted-foreground/60 mb-4">للتعاون التجاري والحملات الإعلانية.</p>
            <a href="mailto:business@hnchat.net" className="text-violet-glow hover:underline text-sm font-medium">business@hnchat.net</a>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ "@context": "https://schema.org", "@type": "ContactPage", name: "تواصل مع HN Chat", url: `${SITE_URL}/contact` }),
          }}
        />
      </div>
    </PublicPageShell>
  );
}
