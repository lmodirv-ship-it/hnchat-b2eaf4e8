import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { MessageSquare, Video, ShoppingBag, Users, Sparkles, Radio, Shield, Globe } from "lucide-react";

const SITE_URL = "https://www.hn-chat.com";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "عن hnChat — منصة تواصل اجتماعي وذكاء اصطناعي عربية | About Us" },
      { name: "description", content: "تعرّف على hnChat — منصة سوبر آب عربية تجمع الدردشة الذكية، التواصل الاجتماعي، الفيديو، التسوق، والبث المباشر في تجربة واحدة متكاملة." },
      { property: "og:title", content: "عن hnChat — من نحن" },
      { property: "og:description", content: "hnChat منصة عربية شاملة تجمع بين الذكاء الاصطناعي والتواصل الاجتماعي والتجارة." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
  component: AboutPage,
});

const features = [
  { icon: Sparkles, title: "ذكاء اصطناعي مدمج", desc: "مساعد AI متقدم للدردشة، توليد الصور، البحث الذكي، وأكثر", color: "text-cyan-glow" },
  { icon: MessageSquare, title: "تواصل اجتماعي", desc: "منشورات، قصص، تعليقات، ورسائل خاصة مع تجربة تفاعلية", color: "text-violet-glow" },
  { icon: Video, title: "فيديوهات وReels", desc: "فيديوهات قصيرة وطويلة مع بث مباشر وغرف صوتية", color: "text-pink-glow" },
  { icon: ShoppingBag, title: "متجر ومتاجر", desc: "سوق إلكتروني متكامل للبيع والشراء والتجارة", color: "text-cyan-glow" },
  { icon: Users, title: "مجموعات ومجتمعات", desc: "أنشئ وانضم لمجموعات حسب اهتماماتك", color: "text-violet-glow" },
  { icon: Radio, title: "بث مباشر", desc: "بث فيديو مباشر وغرف صوتية تفاعلية", color: "text-pink-glow" },
  { icon: Shield, title: "أمان وخصوصية", desc: "حماية متقدمة للبيانات وتشفير شامل", color: "text-cyan-glow" },
  { icon: Globe, title: "متعدد اللغات", desc: "واجهة عربية أصيلة مع دعم للغات متعددة", color: "text-violet-glow" },
];

function AboutPage() {
  return (
    <PublicPageShell>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <section className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow bg-clip-text text-transparent">
            عن hnChat
          </h1>
          <p className="text-base text-foreground/50 mb-2">About hnChat</p>
          <p className="text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto">
            hnChat هي منصة سوبر آب عربية شاملة، صُممت لتجمع كل ما تحتاجه — من التواصل الاجتماعي والذكاء الاصطناعي إلى التسوق والترفيه — في تجربة واحدة سلسة وآمنة.
          </p>
        </section>

        <section className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-violet-glow/15" style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}>
          <h2 className="text-2xl font-bold mb-3 text-cyan-glow">رؤيتنا</h2>
          <p className="leading-relaxed text-foreground/70">
            نسعى لبناء أكبر مجتمع رقمي عربي، يربط الملايين من المستخدمين والمبدعين والتجار في فضاء رقمي حديث وآمن. نؤمن بأن المحتوى العربي يستحق منصة على مستوى عالمي تحترم ثقافته وتلبي احتياجاته.
          </p>
        </section>

        <section className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-cyan-glow/15" style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}>
          <h2 className="text-2xl font-bold mb-3 text-violet-glow">مهمتنا</h2>
          <p className="leading-relaxed text-foreground/70">
            تمكين المستخدم العربي من الوصول إلى أحدث تقنيات الذكاء الاصطناعي والتواصل الرقمي بواجهة عربية أصيلة، مع الحفاظ على أعلى معايير الخصوصية والأمان.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-center mb-6 text-foreground">ما الذي يميّز hnChat؟</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl backdrop-blur-xl p-5 border border-violet-glow/10 hover:border-violet-glow/25 transition-all duration-300" style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                  <h3 className="font-bold text-foreground">{f.title}</h3>
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-pink-glow/15 text-center" style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}>
          <h2 className="text-2xl font-bold mb-3 text-foreground">إحصائيات hnChat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6">
            {[
              { label: "مستخدم نشط", value: "10K+" },
              { label: "رسالة يومياً", value: "50K+" },
              { label: "مجتمع", value: "500+" },
              { label: "دولة", value: "30+" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">{s.value}</div>
                <div className="text-xs text-foreground/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl p-6 sm:p-8 backdrop-blur-xl border border-violet-glow/15 text-center" style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}>
          <h2 className="text-2xl font-bold mb-3 text-foreground">انضم إلينا اليوم</h2>
          <p className="leading-relaxed mb-5 text-foreground/60 max-w-lg mx-auto">
            ابدأ رحلتك مع hnChat — سجّل مجاناً وكُن جزءاً من أكبر مجتمع رقمي عربي متنامٍ.
          </p>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "عن hnChat",
          url: `${SITE_URL}/about`,
          mainEntity: {
            "@type": "Organization",
            name: "hnChat",
            url: SITE_URL,
            description: "منصة سوبر آب عربية تجمع التواصل الاجتماعي والذكاء الاصطناعي والتجارة في مكان واحد",
            logo: `${SITE_URL}/icon-512.png`,
          },
        })}} />
      </div>
    </PublicPageShell>
  );
}
