import { createFileRoute, Link } from "@tanstack/react-router";

const SITE_URL = "https://www.hnchat.net";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "شروط الاستخدام — HN Chat" },
      {
        name: "description",
        content:
          "اطّلع على شروط استخدام منصة HN Chat، والقواعد التي تحكم استخدام الخدمات، وحقوق ومسؤوليات المستخدمين.",
      },
      { property: "og:title", content: "شروط الاستخدام — HN Chat" },
      { property: "og:description", content: "الشروط والأحكام لاستخدام HN Chat." },
      { property: "og:url", content: `${SITE_URL}/terms` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
  }),
  component: TermsPage,
});

function TermsPage() {
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
        <h1 className="text-4xl font-bold">شروط الاستخدام</h1>
        <p className="text-sm text-muted-foreground">آخر تحديث: 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. قبول الشروط</h2>
          <p>باستخدامك HN Chat، فأنت توافق على هذه الشروط. إذا لم توافق، يرجى عدم استخدام المنصة.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. الحساب</h2>
          <p>يجب أن تكون 13 سنة فأكثر. أنت مسؤول عن الحفاظ على أمان كلمة المرور وعن جميع الأنشطة على حسابك.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. المحتوى</h2>
          <ul className="list-disc pr-6 space-y-1">
            <li>تحتفظ بحقوق محتواك، ولكن تمنحنا ترخيصاً لعرضه على المنصة.</li>
            <li>يُمنع نشر محتوى عنيف، إباحي، عنصري، أو مخالف للقانون.</li>
            <li>يحق لنا حذف أي محتوى مخالف دون إشعار مسبق.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. السلوك المحظور</h2>
          <p>يُمنع التحرش، الاحتيال، نشر البريد المزعج، انتحال الشخصية، أو محاولة اختراق المنصة.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. إنهاء الخدمة</h2>
          <p>يحق لنا تعليق أو إنهاء حسابك في حال انتهاك الشروط.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. تعديل الشروط</h2>
          <p>قد نُعدّل هذه الشروط من وقت لآخر، وسنُعلن عن أي تغييرات جوهرية.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. إخلاء المسؤولية</h2>
          <p>تُقدَّم الخدمة "كما هي" دون ضمانات. نحن غير مسؤولين عن أي أضرار غير مباشرة ناتجة عن الاستخدام.</p>
        </section>
      </main>
    </div>
  );
}
