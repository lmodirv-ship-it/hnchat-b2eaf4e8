import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

const SITE_URL = "https://www.hn-chat.com";
const LAST_UPDATED = "7 مايو 2026";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({
    meta: [
      { title: "إرشادات المجتمع — hnChat" },
      { name: "description", content: "إرشادات مجتمع hnChat — القواعد والمعايير التي تحكم التفاعل على المنصة لضمان بيئة آمنة ومحترمة للجميع." },
      { property: "og:title", content: "إرشادات المجتمع — hnChat" },
      { property: "og:description", content: "قواعد ومعايير مجتمع hnChat لبيئة آمنة ومحترمة." },
      { property: "og:url", content: `${SITE_URL}/community-guidelines` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/community-guidelines` }],
  }),
  component: CommunityGuidelinesPage,
});

function SectionCard({ title, children, accent = "cyan" }: { title: string; children: React.ReactNode; accent?: "cyan" | "violet" | "pink" }) {
  const border = accent === "cyan" ? "border-cyan-glow/12" : accent === "violet" ? "border-violet-glow/12" : "border-pink-glow/12";
  const heading = accent === "cyan" ? "text-cyan-glow" : accent === "violet" ? "text-violet-glow" : "text-pink-glow";
  return (
    <section className={`rounded-2xl backdrop-blur-xl p-6 sm:p-8 border ${border}`} style={{ background: "oklch(0.12 0.04 280 / 0.5)" }}>
      <h2 className={`text-xl font-bold mb-4 ${heading}`}>{title}</h2>
      <div className="text-foreground/65 leading-relaxed space-y-3 text-sm sm:text-base">{children}</div>
    </section>
  );
}

function CommunityGuidelinesPage() {
  return (
    <PublicPageShell>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow bg-clip-text text-transparent">
            إرشادات المجتمع
          </h1>
          <p className="text-base text-foreground/50">Community Guidelines</p>
          <p className="text-sm text-foreground/40 mt-2">آخر تحديث: {LAST_UPDATED}</p>
          <p className="text-foreground/60 max-w-2xl mx-auto mt-4">
            نسعى لجعل hnChat مكاناً آمناً ومرحّباً للجميع. هذه الإرشادات تساعدنا على بناء مجتمع إيجابي ومحترم.
          </p>
        </div>

        <SectionCard title="1. الاحترام المتبادل" accent="cyan">
          <p>كل مستخدم يستحق أن يُعامَل باحترام بغض النظر عن خلفيته أو معتقداته أو هويته. نرفض:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>التنمر والتحرش بأي شكل</li>
            <li>خطاب الكراهية والتمييز العنصري أو الديني أو الجنسي</li>
            <li>الإهانات الشخصية والسخرية من الآخرين</li>
            <li>التهديدات أو التخويف</li>
          </ul>
        </SectionCard>

        <SectionCard title="2. المحتوى المسموح" accent="violet">
          <p>نشجع المحتوى الذي:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>يضيف قيمة ويُثري النقاش</li>
            <li>يحترم حقوق الملكية الفكرية</li>
            <li>يكون أصلياً أو يُنسب لمصدره</li>
            <li>يناسب جميع الأعمار</li>
          </ul>
        </SectionCard>

        <SectionCard title="3. المحتوى الممنوع" accent="pink">
          <p><strong>يُمنع تماماً نشر:</strong></p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>محتوى إباحي أو جنسي صريح</li>
            <li>محتوى عنيف أو يروّج للإيذاء الجسدي</li>
            <li>محتوى إرهابي أو متطرف</li>
            <li>معلومات مضللة أو أخبار كاذبة</li>
            <li>محتوى ينتهك حقوق النشر أو العلامات التجارية</li>
            <li>بيانات شخصية للآخرين بدون إذنهم (Doxxing)</li>
            <li>ترويج للمخدرات أو الأنشطة غير القانونية</li>
            <li>برامج ضارة أو روابط خبيثة</li>
          </ul>
        </SectionCard>

        <SectionCard title="4. السلوك في المحادثات والمجموعات" accent="cyan">
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>احترم موضوع المجموعة ولا تخرج عنه</li>
            <li>لا ترسل رسائل متكررة أو بريد مزعج (Spam)</li>
            <li>لا تروّج لمنتجات أو خدمات خارجية بدون إذن</li>
            <li>استخدم لغة مهذبة ومحترمة</li>
            <li>لا تشارك روابط مشبوهة أو احتيالية</li>
          </ul>
        </SectionCard>

        <SectionCard title="5. حماية الخصوصية" accent="violet">
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>لا تشارك معلومات شخصية لمستخدمين آخرين</li>
            <li>لا تلتقط لقطات شاشة من المحادثات الخاصة وتنشرها</li>
            <li>احترم إعدادات الخصوصية للمستخدمين الآخرين</li>
            <li>لا تستخدم بيانات الآخرين لأغراض تسويقية</li>
          </ul>
        </SectionCard>

        <SectionCard title="6. الإعلانات والترويج" accent="cyan">
          <p>قد تظهر إعلانات من أطراف ثالثة (مثل Google AdSense) على المنصة. بالنسبة للترويج الشخصي:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>يُسمح بالترويج المعقول لمحتواك الأصلي</li>
            <li>يُمنع البريد المزعج والرسائل الترويجية المتكررة</li>
            <li>يُمنع الترويج للمنتجات المحظورة أو غير القانونية</li>
            <li>يجب الإفصاح عن المحتوى المدفوع أو المُموّل</li>
          </ul>
        </SectionCard>

        <SectionCard title="7. انتحال الشخصية" accent="violet">
          <p>يُمنع انتحال شخصية أفراد أو مؤسسات أو علامات تجارية. يشمل ذلك:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>استخدام صور أو أسماء أشخاص آخرين</li>
            <li>التظاهر بأنك تمثّل جهة رسمية</li>
            <li>إنشاء حسابات مزيفة لشخصيات عامة</li>
          </ul>
        </SectionCard>

        <SectionCard title="8. الإبلاغ والتنفيذ" accent="pink">
          <p><strong>كيفية الإبلاغ:</strong></p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>اضغط على النقاط الثلاث (...) بجانب أي محتوى واختر "إبلاغ"</li>
            <li>أو راسلنا على: <a href="mailto:abuse@hnchat.net" className="text-pink-glow hover:underline">abuse@hnchat.net</a></li>
          </ul>
          <p><strong>الإجراءات التي قد نتخذها:</strong></p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>تحذير المستخدم</li>
            <li>حذف المحتوى المخالف</li>
            <li>تعليق الحساب مؤقتاً</li>
            <li>حظر الحساب نهائياً في الحالات الخطيرة</li>
          </ul>
        </SectionCard>

        <SectionCard title="9. حماية القاصرين" accent="cyan">
          <p>نأخذ سلامة القاصرين على محمل الجد:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>الحد الأدنى للعمر هو 13 عاماً</li>
            <li>يُمنع أي محتوى يستغل القاصرين</li>
            <li>نبلّغ الجهات المختصة عن أي محتوى يتعلق باستغلال الأطفال</li>
          </ul>
        </SectionCard>

        <SectionCard title="10. تحديث الإرشادات" accent="violet">
          <p>قد نحدّث هذه الإرشادات من وقت لآخر لتعكس التغييرات في المنصة والقوانين. سنُخطرك بالتغييرات الجوهرية. استمرارك في استخدام المنصة يعني موافقتك على الإرشادات المحدّثة.</p>
          <p>إذا كانت لديك أسئلة حول هذه الإرشادات، تواصل معنا عبر: <a href="mailto:support@hnchat.net" className="text-violet-glow hover:underline">support@hnchat.net</a></p>
        </SectionCard>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "إرشادات المجتمع — hnChat",
          url: `${SITE_URL}/community-guidelines`,
          description: "إرشادات ومعايير مجتمع hnChat",
          publisher: { "@type": "Organization", name: "hnChat", url: SITE_URL },
        })}} />
      </div>
    </PublicPageShell>
  );
}
