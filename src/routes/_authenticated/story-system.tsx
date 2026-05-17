import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Sparkles, BarChart3, Mic, Wand2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/story-system")({
  head: () => ({
    meta: [
      { title: "Story System — hnChat" },
      { name: "description", content: "قصص مع تأثيرات AI، استطلاعات، وقصص صوتية." },
    ],
  }),
  component: Page,
});

const FEATURES = [
  { icon: Wand2, title: "AI Effects", desc: "فلاتر ذكية تلقائية" },
  { icon: BarChart3, title: "استطلاعات Polls", desc: "تفاعل مباشر مع جمهورك" },
  { icon: Mic, title: "Voice Story", desc: "قصص صوتية بنبضك" },
  { icon: Sparkles, title: "AI Stickers", desc: "ملصقات تُولَّد لحظياً" },
];

function Page() {
  return (
    <PageShell
      title="Story System+"
      subtitle="قصص متطورة بقدرات الذكاء الاصطناعي"
      action={<Sparkles className="h-5 w-5 text-cyan-glow" />}
    >
      <Link to="/stories">
        <Card className="p-6 bg-gradient-to-br from-cyan-glow/15 to-violet-glow/15 border-ice-border mb-6 hover:border-cyan-glow/40 transition">
          <h2 className="text-xl font-bold mb-1">انتقل إلى القصص</h2>
          <p className="text-sm text-muted-foreground">شاهد القصص الحالية أو ابدأ قصة جديدة</p>
        </Card>
      </Link>

      <h2 className="text-lg font-bold mb-3">الميزات الجديدة</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="p-4 bg-ice-card border-ice-border">
              <Icon className="h-6 w-6 text-cyan-glow mb-2" />
              <h3 className="font-bold mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
