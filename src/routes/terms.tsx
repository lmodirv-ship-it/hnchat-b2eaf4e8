import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

const SITE_URL = "https://www.hn-chat.com";
const LAST_UPDATED = "7 مايو 2026";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "شروط الاستخدام — hnChat | Terms of Service" },
      { name: "description", content: "شروط وأحكام استخدام منصة hnChat. تعرّف على حقوقك ومسؤولياتك كمستخدم، وقواعد المنصة والسياسات المعمول بها." },
      { property: "og:title", content: "شروط الاستخدام — hnChat" },
      { property: "og:description", content: "الشروط والأحكام الكاملة لاستخدام منصة hnChat." },
      { property: "og:url", content: `${SITE_URL}/terms` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
  }),
  component: TermsPage,
});

function SectionCard({ title, children, accent = "violet" }: { title: string; children: React.ReactNode; accent?: "cyan" | "violet" | "pink" }) {
  const border = accent === "cyan" ? "border-cyan-glow/12" : accent === "violet" ? "border-violet-glow/12" : "border-pink-glow/12";
  const heading = accent === "cyan" ? "text-cyan-glow" : accent === "violet" ? "text-violet-glow" : "text-pink-glow";
  return (
    <section className={`rounded-2xl backdrop-blur-xl p-6 sm:p-8 border ${border}`} style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}>
      <h2 className={`text-xl font-bold mb-4 ${heading}`}>{title}</h2>
      <div className="text-foreground/65 leading-relaxed space-y-3 text-sm sm:text-base">{children}</div>
    </section>
  );
}

function TermsPage() {
  return (
    <PublicPageShell>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-violet-glow via-cyan-glow to-pink-glow bg-clip-text text-transparent">
            شروط الاستخدام
          </h1>
          <p className="text-base text-foreground/50">Terms of Service</p>
          <p className="text-sm text-foreground/40 mt-2">آخر تحديث: {LAST_UPDATED}</p>
        </div>

        <SectionCard title="1. قبول الشروط" accent="violet">
          <p>باستخدامك لمنصة hnChat ("الخدمة")، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا لم توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة. تنطبق هذه الشروط على جميع المستخدمين بما في ذلك الزوار والمستخدمين المسجلين.</p>
        </SectionCard>

        <SectionCard title="2. الأهلية" accent="cyan">
          <p>يجب أن يكون عمرك 13 عاماً على الأقل لاستخدام hnChat. إذا كنت بين 13 و18 عاماً، يجب أن يوافق ولي أمرك على استخدامك للمنصة. باستخدامك للخدمة، تُقر بأنك تستوفي هذه المتطلبات.</p>
        </SectionCard>

        <SectionCard title="3. حسابك" accent="violet">
          <p>أنت مسؤول عن:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>الحفاظ على سرية كلمة المرور وأمان حسابك</li>
            <li>جميع الأنشطة التي تتم من خلال حسابك</li>
            <li>إبلاغنا فوراً عن أي استخدام غير مصرح به</li>
            <li>تقديم معلومات دقيقة ومحدّثة</li>
          </ul>
          <p>يحق لنا تعليق أو إنهاء حسابك في حال انتهاك هذه الشروط.</p>
        </SectionCard>

        <SectionCard title="4. المحتوى الذي تنشره" accent="pink">
          <p>تحتفظ بحقوق الملكية الفكرية لمحتواك الأصلي، لكنك تمنحنا ترخيصاً غير حصري وعالمي وخالياً من حقوق الملكية لاستخدامه وعرضه وتوزيعه على المنصة.</p>
          <p><strong>يُمنع نشر:</strong></p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>محتوى عنيف أو إباحي أو تحريضي</li>
            <li>محتوى عنصري أو يروّج للكراهية</li>
            <li>محتوى ينتهك حقوق الملكية الفكرية للآخرين</li>
            <li>معلومات مضللة أو أخبار كاذبة</li>
            <li>بريد مزعج أو محتوى ترويجي غير مرغوب</li>
          </ul>
        </SectionCard>

        <SectionCard title="5. السلوك المحظور" accent="violet">
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>التحرش أو التنمر أو تهديد المستخدمين الآخرين</li>
            <li>انتحال شخصية أفراد أو مؤسسات</li>
            <li>الاحتيال أو محاولة خداع المستخدمين</li>
            <li>محاولة اختراق أو تعطيل خدمات المنصة</li>
            <li>جمع بيانات المستخدمين بدون إذن</li>
            <li>استخدام المنصة لأنشطة غير قانونية</li>
            <li>التحايل على أنظمة الحماية والأمان</li>
          </ul>
        </SectionCard>

        <SectionCard title="6. الإعلانات" accent="cyan">
          <p>قد تحتوي المنصة على إعلانات مقدمة من أطراف ثالثة (بما في ذلك Google AdSense). لا نتحمل مسؤولية محتوى الإعلانات أو المنتجات/الخدمات المُعلن عنها. تفاعلك مع الإعلانات يخضع لشروط المعلنين.</p>
        </SectionCard>

        <SectionCard title="7. الملكية الفكرية" accent="violet">
          <p>جميع حقوق الملكية الفكرية لمنصة hnChat (التصميم، الشعارات، الكود البرمجي، العلامات التجارية) مملوكة لنا. لا يجوز نسخها أو تعديلها أو توزيعها بدون إذن كتابي مسبق.</p>
        </SectionCard>

        <SectionCard title="8. إنهاء الخدمة" accent="pink">
          <p>يحق لنا تعليق أو إنهاء حسابك وحذف محتواك في أي وقت إذا:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>انتهكت هذه الشروط أو إرشادات المجتمع</li>
            <li>تسببت في ضرر للمنصة أو مستخدميها</li>
            <li>استخدمت المنصة بطريقة غير قانونية</li>
          </ul>
          <p>يمكنك أيضاً حذف حسابك في أي وقت من إعدادات الحساب.</p>
        </SectionCard>

        <SectionCard title="9. إخلاء المسؤولية" accent="violet">
          <p>تُقدَّم الخدمة "كما هي" و"حسب التوافر" بدون ضمانات صريحة أو ضمنية. لا نضمن أن الخدمة ستكون متاحة دائماً أو خالية من الأخطاء. لا نتحمل المسؤولية عن:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>أي أضرار مباشرة أو غير مباشرة ناتجة عن الاستخدام</li>
            <li>فقدان البيانات أو الأرباح</li>
            <li>محتوى المستخدمين الآخرين</li>
            <li>انقطاع الخدمة أو مشاكل تقنية</li>
          </ul>
        </SectionCard>

        <SectionCard title="10. تعديل الشروط" accent="cyan">
          <p>نحتفظ بحق تعديل هذه الشروط في أي وقت. سنُخطرك بالتغييرات الجوهرية عبر إشعار على المنصة أو بريد إلكتروني. استمرارك في استخدام الخدمة بعد التعديل يعني موافقتك على الشروط المحدّثة.</p>
        </SectionCard>

        <SectionCard title="11. القانون المعمول به" accent="violet">
          <p>تخضع هذه الشروط للقوانين المعمول بها. أي نزاع ينشأ عن استخدام المنصة يُحل عبر التفاوض أولاً، ثم عبر التحكيم إذا لزم الأمر.</p>
        </SectionCard>

        <SectionCard title="12. التواصل" accent="cyan">
          <p>لأي استفسارات حول هذه الشروط:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>البريد الإلكتروني: <a href="mailto:legal@hnchat.net" className="text-cyan-glow hover:underline">legal@hnchat.net</a></li>
            <li>صفحة التواصل: <a href="/contact" className="text-cyan-glow hover:underline">www.hn-chat.com/contact</a></li>
          </ul>
        </SectionCard>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "شروط الاستخدام — hnChat",
          url: `${SITE_URL}/terms`,
          description: "شروط وأحكام استخدام منصة hnChat",
          publisher: { "@type": "Organization", name: "hnChat", url: SITE_URL },
        })}} />
      </div>
    </PublicPageShell>
  );
}
