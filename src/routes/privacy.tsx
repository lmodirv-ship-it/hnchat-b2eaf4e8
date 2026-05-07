import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

const SITE_URL = "https://www.hn-chat.com";
const LAST_UPDATED = "7 مايو 2026";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية — hnChat | Privacy Policy" },
      { name: "description", content: "سياسة خصوصية hnChat — كيف نجمع بياناتك ونستخدمها ونحميها. متوافقة مع GDPR والمعايير الدولية لحماية البيانات." },
      { property: "og:title", content: "سياسة الخصوصية — hnChat" },
      { property: "og:description", content: "تعرّف على كيفية حماية بياناتك على hnChat وحقوقك كمستخدم." },
      { property: "og:url", content: `${SITE_URL}/privacy` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
  }),
  component: PrivacyPage,
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

function PrivacyPage() {
  return (
    <PublicPageShell>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-glow via-violet-glow to-pink-glow bg-clip-text text-transparent">
            سياسة الخصوصية
          </h1>
          <p className="text-base text-foreground/50">Privacy Policy</p>
          <p className="text-sm text-foreground/40 mt-2">آخر تحديث: {LAST_UPDATED}</p>
        </div>

        <SectionCard title="1. مقدمة" accent="cyan">
          <p>مرحباً بك في hnChat (المشار إليها بـ "نحن" أو "المنصة" أو "الخدمة"). نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية وفقاً للقوانين الدولية لحماية البيانات بما في ذلك اللائحة العامة لحماية البيانات (GDPR) والقوانين المحلية المعمول بها.</p>
          <p>تنطبق هذه السياسة على جميع الخدمات التي تقدمها hnChat عبر موقع الويب (www.hn-chat.com) وتطبيقات الهاتف المحمول.</p>
        </SectionCard>

        <SectionCard title="2. المعلومات التي نجمعها" accent="violet">
          <p><strong>معلومات تقدمها مباشرة:</strong></p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>معلومات التسجيل: الاسم، البريد الإلكتروني، اسم المستخدم</li>
            <li>معلومات الملف الشخصي: الصورة الشخصية، النبذة التعريفية</li>
            <li>المحتوى المنشور: المنشورات، التعليقات، الرسائل، الوسائط</li>
            <li>بيانات التواصل: الرسائل المرسلة عبر صفحة التواصل</li>
          </ul>
          <p><strong>معلومات نجمعها تلقائياً:</strong></p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>عنوان IP ونوع المتصفح ونظام التشغيل</li>
            <li>بيانات الجهاز ودقة الشاشة</li>
            <li>صفحات الإحالة وسلوك التصفح</li>
            <li>بيانات تحليلات الويب (Google Analytics)</li>
          </ul>
        </SectionCard>

        <SectionCard title="3. كيف نستخدم بياناتك" accent="cyan">
          <ul className="list-disc list-inside space-y-2 mr-4">
            <li>تشغيل وتحسين وصيانة خدمات المنصة</li>
            <li>تخصيص تجربتك وعرض المحتوى ذي الصلة</li>
            <li>التواصل معك بشأن حسابك وتحديثات الخدمة</li>
            <li>الحفاظ على أمان المنصة ومنع الاحتيال</li>
            <li>تحليل أنماط الاستخدام لتحسين الأداء</li>
            <li>الامتثال للالتزامات القانونية</li>
          </ul>
        </SectionCard>

        <SectionCard title="4. الإعلانات وملفات تعريف الارتباط (Cookies)" accent="pink">
          <p>نستخدم خدمات إعلانية من أطراف ثالثة، بما في ذلك Google AdSense، لعرض إعلانات على المنصة. قد تستخدم هذه الخدمات ملفات تعريف الارتباط (Cookies) وتقنيات مشابهة لعرض إعلانات مخصصة بناءً على اهتماماتك.</p>
          <p><strong>أنواع الكوكيز المستخدمة:</strong></p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li><strong>كوكيز ضرورية:</strong> لتشغيل الموقع والحفاظ على جلسة تسجيل الدخول</li>
            <li><strong>كوكيز تحليلية:</strong> لفهم كيفية استخدام الزوار للموقع (Google Analytics)</li>
            <li><strong>كوكيز إعلانية:</strong> لعرض إعلانات ذات صلة (Google AdSense)</li>
          </ul>
          <p>يمكنك إدارة تفضيلات الكوكيز من إعدادات متصفحك. لمزيد من المعلومات حول إعلانات Google، يرجى زيارة <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-glow hover:underline">سياسة إعلانات Google</a>.</p>
        </SectionCard>

        <SectionCard title="5. مشاركة البيانات مع أطراف ثالثة" accent="violet">
          <p>لا نبيع بياناتك الشخصية أبداً. قد نشاركها فقط في الحالات التالية:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة (استضافة، تحليلات)</li>
            <li>مع شركاء الإعلانات (بيانات مجهولة الهوية فقط)</li>
            <li>عند الاقتضاء بموجب القانون أو أمر قضائي</li>
            <li>لحماية حقوقنا وسلامة المستخدمين</li>
          </ul>
        </SectionCard>

        <SectionCard title="6. حقوقك (GDPR)" accent="cyan">
          <p>بموجب اللائحة العامة لحماية البيانات، لديك الحقوق التالية:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li><strong>حق الوصول:</strong> طلب نسخة من بياناتك الشخصية</li>
            <li><strong>حق التصحيح:</strong> تعديل بياناتك غير الدقيقة</li>
            <li><strong>حق الحذف:</strong> طلب حذف بياناتك ("الحق في النسيان")</li>
            <li><strong>حق النقل:</strong> الحصول على بياناتك بصيغة قابلة للنقل</li>
            <li><strong>حق الاعتراض:</strong> الاعتراض على معالجة بياناتك</li>
            <li><strong>حق تقييد المعالجة:</strong> طلب تقييد استخدام بياناتك</li>
          </ul>
          <p>لممارسة أي من هذه الحقوق، تواصل معنا عبر: <a href="mailto:privacy@hnchat.net" className="text-cyan-glow hover:underline">privacy@hnchat.net</a></p>
        </SectionCard>

        <SectionCard title="7. أمان البيانات" accent="violet">
          <p>نتخذ إجراءات أمنية مناسبة لحماية بياناتك، بما في ذلك:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>تشفير البيانات أثناء النقل (TLS/SSL)</li>
            <li>التحكم في الوصول وإدارة الصلاحيات</li>
            <li>مراقبة أمنية مستمرة</li>
            <li>نسخ احتياطي منتظم للبيانات</li>
          </ul>
        </SectionCard>

        <SectionCard title="8. بيانات الأطفال" accent="pink">
          <p>hnChat غير موجهة للأطفال دون سن 13 عاماً. لا نجمع بيانات من أطفال دون هذا السن عن علم. إذا اكتشفنا أن طفلاً دون 13 عاماً قد أنشأ حساباً، سنحذفه فوراً.</p>
        </SectionCard>

        <SectionCard title="9. الاحتفاظ بالبيانات" accent="cyan">
          <p>نحتفظ ببياناتك طالما حسابك نشط أو حسب الحاجة لتقديم الخدمات. عند حذف حسابك، نحذف بياناتك الشخصية خلال 30 يوماً، باستثناء ما يتطلبه القانون.</p>
        </SectionCard>

        <SectionCard title="10. التحديثات على هذه السياسة" accent="violet">
          <p>قد نحدّث هذه السياسة من وقت لآخر. سننشر أي تغييرات على هذه الصفحة مع تحديث تاريخ "آخر تحديث". استمرارك في استخدام المنصة بعد النشر يعني موافقتك على التغييرات.</p>
        </SectionCard>

        <SectionCard title="11. التواصل معنا" accent="cyan">
          <p>إذا كانت لديك أسئلة حول هذه السياسة أو ممارسات الخصوصية لدينا:</p>
          <ul className="list-disc list-inside space-y-1 mr-4">
            <li>البريد الإلكتروني: <a href="mailto:privacy@hnchat.net" className="text-cyan-glow hover:underline">privacy@hnchat.net</a></li>
            <li>صفحة التواصل: <a href="/contact" className="text-cyan-glow hover:underline">www.hn-chat.com/contact</a></li>
          </ul>
        </SectionCard>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "سياسة الخصوصية — hnChat",
          url: `${SITE_URL}/privacy`,
          description: "سياسة خصوصية hnChat — متوافقة مع GDPR",
          publisher: { "@type": "Organization", name: "hnChat", url: SITE_URL },
        })}} />
      </div>
    </PublicPageShell>
  );
}
