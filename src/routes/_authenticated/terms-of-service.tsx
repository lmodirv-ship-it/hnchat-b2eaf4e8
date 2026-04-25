import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/terms-of-service")({
  component: TermsPage,
});

const sections = [
  { title: "قبول الشروط", body: "باستخدامك hnChat فإنك توافق على هذه الشروط بالكامل. إذا لم توافق، يُرجى عدم استخدام الخدمة." },
  { title: "الحساب", body: "أنت مسؤول عن سرية بيانات حسابك وعن جميع الأنشطة التي تتم من خلاله." },
  { title: "المحتوى", body: "تحتفظ بملكية المحتوى الذي تنشره، وتمنحنا ترخيصاً لعرضه وتوزيعه ضمن الخدمة." },
  { title: "الاستخدام المحظور", body: "يُمنع نشر محتوى غير قانوني، أو مسيء، أو ينتهك حقوق الآخرين، أو يحتوي على برمجيات خبيثة." },
  { title: "إخلاء المسؤولية", body: "تُقدَّم الخدمة \"كما هي\" دون أي ضمانات. لا نتحمّل مسؤولية أي خسائر ناتجة عن استخدامها." },
  { title: "تعديل الشروط", body: "قد نُحدّث هذه الشروط في أي وقت. استمرار استخدامك يعني موافقتك على النسخة المحدّثة." },
];

function TermsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-glow/30 to-pink-glow/20 border border-violet-glow/40 flex items-center justify-center">
          <ScrollText className="h-6 w-6 text-violet-glow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">شروط الاستخدام</h1>
          <p className="text-xs text-muted-foreground">آخر تحديث: 2026-04-25</p>
        </div>
      </header>
      <div className="space-y-4">
        {sections.map((s) => (
          <section key={s.title} className="rounded-xl border border-ice-border bg-ice-card p-5">
            <h2 className="text-sm font-semibold mb-2 text-violet-glow">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
