import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

const SITE_URL = "https://www.hn-chat.com";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — HN Chat" },
      { name: "description", content: "تعرّف على كيفية جمع HN Chat لبياناتك واستخدامها وحمايتها وحقوقك كمستخدم على المنصة." },
      { property: "og:title", content: "سياسة الخصوصية — HN Chat" },
      { property: "og:description", content: "كيف نحمي بياناتك على HN Chat." },
      { property: "og:url", content: `${SITE_URL}/privacy` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const sections = [
    { title: "1. المعلومات التي نجمعها", content: "نجمع المعلومات التي تقدّمها عند التسجيل (الاسم، البريد الإلكتروني)، والمحتوى الذي تنشره، وبيانات الاستخدام التقنية (IP, نوع المتصفح)." },
    { title: "2. كيف نستخدم بياناتك", list: ["تشغيل وتحسين الخدمات", "تخصيص التجربة والمحتوى", "التواصل معك بشأن حسابك", "الحفاظ على أمان المنصة"] },
    { title: "3. مشاركة البيانات", content: "لا نبيع بياناتك. قد نشاركها فقط مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة، وضمن ما يفرضه القانون." },
    { title: "4. حقوقك", content: "يمكنك في أي وقت الوصول إلى بياناتك، تعديلها، أو حذف حسابك بالكامل من إعدادات الحساب." },
    { title: "5. ملفات الكوكيز", content: "نستخدم الكوكيز للحفاظ على جلسة تسجيل الدخول وتحسين الأداء." },
    { title: "6. التواصل معنا", content: "لأي استفسار حول الخصوصية، تواصل معنا عبر صفحات الدعم في المنصة." },
  ];

  return (
    <PublicPageShell>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
            سياسة الخصوصية
          </h1>
          <p className="text-sm text-muted-foreground/50">آخر تحديث: 2026</p>
        </div>

        {sections.map((s) => (
          <section
            key={s.title}
            className="rounded-2xl border border-ice-border/15 bg-ice-card/10 backdrop-blur-xl p-6"
          >
            <h2 className="text-xl font-bold mb-3">{s.title}</h2>
            {s.content && <p className="text-muted-foreground/70 leading-relaxed">{s.content}</p>}
            {s.list && (
              <ul className="space-y-2">
                {s.list.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow flex-shrink-0" />
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
