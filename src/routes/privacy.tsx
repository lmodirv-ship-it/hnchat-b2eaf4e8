import { createFileRoute, Link } from "@tanstack/react-router";

const SITE_URL = "https://www.hn-chat.com";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — HN Chat" },
      {
        name: "description",
        content:
          "تعرّف على كيفية جمع HN Chat لبياناتك واستخدامها وحمايتها وحقوقك كمستخدم على المنصة.",
      },
      { property: "og:title", content: "سياسة الخصوصية — HN Chat" },
      { property: "og:description", content: "كيف نحمي بياناتك على HN Chat." },
      { property: "og:url", content: `${SITE_URL}/privacy` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-4xl font-bold">سياسة الخصوصية</h1>
        <p className="text-sm text-muted-foreground">آخر تحديث: 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. المعلومات التي نجمعها</h2>
          <p>نجمع المعلومات التي تقدّمها عند التسجيل (الاسم، البريد الإلكتروني)، والمحتوى الذي تنشره، وبيانات الاستخدام التقنية (IP, نوع المتصفح).</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. كيف نستخدم بياناتك</h2>
          <ul className="list-disc pr-6 space-y-1">
            <li>تشغيل وتحسين الخدمات</li>
            <li>تخصيص التجربة والمحتوى</li>
            <li>التواصل معك بشأن حسابك</li>
            <li>الحفاظ على أمان المنصة</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. مشاركة البيانات</h2>
          <p>لا نبيع بياناتك. قد نشاركها فقط مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة، وضمن ما يفرضه القانون.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. حقوقك</h2>
          <p>يمكنك في أي وقت الوصول إلى بياناتك، تعديلها، أو حذف حسابك بالكامل من إعدادات الحساب.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. ملفات الكوكيز</h2>
          <p>نستخدم الكوكيز للحفاظ على جلسة تسجيل الدخول وتحسين الأداء.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. التواصل معنا</h2>
          <p>لأي استفسار حول الخصوصية، تواصل معنا عبر صفحات الدعم في المنصة.</p>
        </section>
      </main>
    </div>
  );
}
