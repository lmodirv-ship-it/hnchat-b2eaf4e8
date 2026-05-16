import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Mail, Handshake, ShieldAlert, MessageCircle, Clock } from "lucide-react";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";

const SITE_URL = "https://www.hn-chat.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا — hnChat" },
      { name: "description", content: "تواصل مع فريق hnChat للدعم الفني، الشراكات، الإعلانات، الاقتراحات، أو الاستفسارات. فريقنا هنا لمساعدتك." },
      { property: "og:title", content: "تواصل معنا — hnChat" },
      { property: "og:description", content: "تواصل مع فريق hnChat — دعم فني، شراكات، وإعلانات." },
      { property: "og:url", content: `${SITE_URL}/contact` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: ContactPage,
});

const contactCards = [
  {
    icon: Mail,
    title: "الدعم العام",
    desc: "للمساعدة في استخدام المنصة أو حل المشاكل التقنية",
    email: "support@hnchat.net",
    color: "text-cyan-glow",
    border: "border-cyan-glow/15 hover:border-cyan-glow/40",
  },
  {
    icon: Handshake,
    title: "الشراكات والإعلانات",
    desc: "للتعاون التجاري، الحملات الإعلانية، ورعاية المحتوى",
    email: "business@hnchat.net",
    color: "text-violet-glow",
    border: "border-violet-glow/15 hover:border-violet-glow/40",
  },
  {
    icon: ShieldAlert,
    title: "الإبلاغ عن انتهاكات",
    desc: "للإبلاغ عن محتوى مخالف أو سلوك غير لائق على المنصة",
    email: "abuse@hnchat.net",
    color: "text-pink-glow",
    border: "border-pink-glow/15 hover:border-pink-glow/40",
  },
  {
    icon: MessageCircle,
    title: "الاقتراحات والملاحظات",
    desc: "نحب سماع أفكارك لتحسين المنصة وتطويرها",
    email: "feedback@hnchat.net",
    color: "text-cyan-glow",
    border: "border-cyan-glow/15 hover:border-cyan-glow/40",
  },
];

function ContactPage() {
  return (
    <PublicPageShell>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <section className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow bg-clip-text text-transparent">
            تواصل معنا
          </h1>
          <p className="text-base text-foreground/50 mb-2">Contact Us</p>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">نحن هنا لمساعدتك. اختر القسم المناسب وسنرد عليك في أقرب وقت.</p>
        </section>

        <div className="grid gap-5 sm:grid-cols-2">
          {contactCards.map((c) => (
            <div
              key={c.email}
              className={`rounded-2xl backdrop-blur-xl p-6 border ${c.border} transition-all duration-300`}
              style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <c.icon className={`h-5 w-5 ${c.color}`} />
                <h2 className={`font-bold text-lg ${c.color}`}>{c.title}</h2>
              </div>
              <p className="text-sm text-foreground/50 mb-4">{c.desc}</p>
              <a href={`mailto:${c.email}`} className={`${c.color} hover:underline text-sm font-medium`}>{c.email}</a>
            </div>
          ))}
        </div>

        <section className="rounded-2xl backdrop-blur-xl p-6 sm:p-8 border border-violet-glow/12 text-center" style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-violet-glow" />
            <h2 className="text-xl font-bold text-violet-glow">أوقات الرد</h2>
          </div>
          <p className="text-foreground/60 text-sm">نسعى للرد على جميع الرسائل خلال 24-48 ساعة عمل.</p>
          <p className="text-foreground/40 text-xs mt-2">أيام العمل: الأحد – الخميس | 9:00 صباحاً – 6:00 مساءً (بتوقيت GMT+1)</p>
        </section>

        <section className="rounded-2xl backdrop-blur-xl p-6 sm:p-8 border border-cyan-glow/12" style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}>
          <h2 className="text-xl font-bold mb-4 text-cyan-glow">الأسئلة الشائعة</h2>
          <div className="space-y-4 text-sm">
            {[
              { q: "كيف أحذف حسابي؟", a: "اذهب إلى الإعدادات > إدارة الحساب > حذف الحساب." },
              { q: "كيف أبلّغ عن محتوى مخالف؟", a: "اضغط على النقاط الثلاث بجانب المحتوى واختر 'إبلاغ'، أو راسلنا على abuse@hnchat.net." },
              { q: "هل hnChat مجاني؟", a: "نعم، hnChat مجاني بالكامل مع ميزات أساسية متاحة لجميع المستخدمين." },
              { q: "كيف أعلن على hnChat؟", a: "تواصل معنا عبر business@hnchat.net لمناقشة خيارات الإعلان والشراكة." },
            ].map((faq) => (
              <div key={faq.q}>
                <p className="font-semibold text-foreground/80">{faq.q}</p>
                <p className="text-foreground/55 mt-1">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "تواصل مع hnChat",
          url: `${SITE_URL}/contact`,
          publisher: { "@type": "Organization", name: "hnChat", url: SITE_URL },
        })}} />

        {/* Ad Unit */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          <AdSenseUnit className="rounded-xl overflow-hidden" />
        </div>
      </div>
    </PublicPageShell>
  );
}
