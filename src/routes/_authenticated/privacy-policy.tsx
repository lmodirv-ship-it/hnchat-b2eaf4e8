import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/privacy-policy")({
  component: PrivacyPage,
});

const sections = [
  { title: "مقدمة", body: "نحن في hnChat نُولي خصوصيتك أهمية قصوى. توضّح هذه السياسة كيف نجمع ونستخدم ونحمي بياناتك." },
  { title: "البيانات التي نجمعها", body: "بريدك الإلكتروني، اسم العرض، الصورة الرمزية، المحتوى الذي تنشره، وبيانات الاستخدام التقنية (IP، نوع الجهاز)." },
  { title: "كيف نستخدم البيانات", body: "لتقديم الخدمة، تخصيص التجربة، تحسين الأداء، إرسال إشعارات تتعلق بحسابك، ومنع الاحتيال." },
  { title: "المشاركة مع أطراف ثالثة", body: "لا نبيع بياناتك. نشاركها فقط مع موفّري البنية التحتية (الاستضافة، التحليلات) وفق اتفاقيات سرية." },
  { title: "حقوقك", body: "يحقّ لك الوصول إلى بياناتك أو تعديلها أو حذفها في أي وقت من خلال صفحة الإعدادات." },
  { title: "التواصل", body: "لأي استفسار حول الخصوصية، تواصل معنا عبر privacy@hnchat.app." },
];

function PrivacyPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-glow/30 to-violet-glow/20 border border-cyan-glow/40 flex items-center justify-center">
          <FileText className="h-6 w-6 text-cyan-glow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">سياسة الخصوصية</h1>
          <p className="text-xs text-muted-foreground">آخر تحديث: 2026-04-25</p>
        </div>
      </header>
      <div className="space-y-4">
        {sections.map((s) => (
          <section key={s.title} className="rounded-xl border border-ice-border bg-ice-card p-5">
            <h2 className="text-sm font-semibold mb-2 text-cyan-glow">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
