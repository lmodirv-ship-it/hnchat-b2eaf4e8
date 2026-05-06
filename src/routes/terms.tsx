import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

const SITE_URL = "https://www.hn-chat.com";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "شروط الاستخدام — HN Chat" },
      { name: "description", content: "اطّلع على شروط استخدام منصة HN Chat، والقواعد التي تحكم استخدام الخدمات، وحقوق ومسؤوليات المستخدمين." },
      { property: "og:title", content: "شروط الاستخدام — HN Chat" },
      { property: "og:description", content: "الشروط والأحكام لاستخدام HN Chat." },
      { property: "og:url", content: `${SITE_URL}/terms` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const sections = [
    { title: "1. قبول الشروط", content: "باستخدامك HN Chat، فأنت توافق على هذه الشروط. إذا لم توافق، يرجى عدم استخدام المنصة." },
    { title: "2. الحساب", content: "يجب أن تكون 13 سنة فأكثر. أنت مسؤول عن الحفاظ على أمان كلمة المرور وعن جميع الأنشطة على حسابك." },
    { title: "3. المحتوى", list: ["تحتفظ بحقوق محتواك، ولكن تمنحنا ترخيصاً لعرضه على المنصة.", "يُمنع نشر محتوى عنيف، إباحي، عنصري، أو مخالف للقانون.", "يحق لنا حذف أي محتوى مخالف دون إشعار مسبق."] },
    { title: "4. السلوك المحظور", content: "يُمنع التحرش، الاحتيال، نشر البريد المزعج، انتحال الشخصية، أو محاولة اختراق المنصة." },
    { title: "5. إنهاء الخدمة", content: "يحق لنا تعليق أو إنهاء حسابك في حال انتهاك الشروط." },
    { title: "6. تعديل الشروط", content: "قد نُعدّل هذه الشروط من وقت لآخر، وسنُعلن عن أي تغييرات جوهرية." },
    { title: "7. إخلاء المسؤولية", content: "تُقدَّم الخدمة \"كما هي\" دون ضمانات. نحن غير مسؤولين عن أي أضرار غير مباشرة ناتجة عن الاستخدام." },
  ];

  const gradients = [
    "linear-gradient(135deg, oklch(0.16 0.07 280 / 0.55) 0%, oklch(0.13 0.05 265 / 0.4) 100%)",
    "linear-gradient(135deg, oklch(0.18 0.08 290 / 0.6) 0%, oklch(0.14 0.06 270 / 0.4) 100%)",
    "linear-gradient(135deg, oklch(0.15 0.06 260 / 0.5) 0%, oklch(0.12 0.07 290 / 0.4) 100%)",
    "linear-gradient(135deg, oklch(0.17 0.08 300 / 0.5) 0%, oklch(0.12 0.06 275 / 0.4) 100%)",
    "linear-gradient(135deg, oklch(0.15 0.07 270 / 0.55) 0%, oklch(0.11 0.05 285 / 0.4) 100%)",
    "linear-gradient(135deg, oklch(0.16 0.06 255 / 0.5) 0%, oklch(0.13 0.08 295 / 0.4) 100%)",
    "linear-gradient(135deg, oklch(0.14 0.07 275 / 0.5) 0%, oklch(0.11 0.06 260 / 0.4) 100%)",
  ];

  return (
    <PublicPageShell>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <div className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-violet-glow via-cyan-glow to-pink-glow bg-clip-text text-transparent">
            شروط الاستخدام
          </h1>
          <p className="text-sm text-foreground/40">آخر تحديث: 2026</p>
        </div>

        {sections.map((s, i) => (
          <section
            key={s.title}
            className="rounded-2xl backdrop-blur-xl p-6 border border-violet-glow/12"
            style={{ background: gradients[i % gradients.length] }}
          >
            <h2 className="text-xl font-bold mb-3 text-violet-glow">{s.title}</h2>
            {s.content && <p className="text-foreground/65 leading-relaxed">{s.content}</p>}
            {s.list && (
              <ul className="space-y-2">
                {s.list.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-glow shadow-[0_0_6px_oklch(0.65_0.25_295/0.6)] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </PublicPageShell>
  );
}
