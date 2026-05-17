import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Languages, FileText, Bot, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ai-voice-rooms")({
  head: () => ({
    meta: [
      { title: "AI Voice Rooms — hnChat" },
      { name: "description", content: "غرف صوتية ذكية مع ترجمة مباشرة وتلخيص ومساعد AI داخل الغرفة." },
    ],
  }),
  component: Page,
});

const FEATURES = [
  { icon: Languages, title: "ترجمة مباشرة", desc: "ترجمة فورية بين العربية والإنجليزية والفرنسية" },
  { icon: FileText, title: "تلخيص المحادثة", desc: "ملخص ذكي للنقاط الرئيسية بعد انتهاء الغرفة" },
  { icon: Bot, title: "AI داخل الغرفة", desc: "اسأل المساعد الذكي مباشرة أثناء النقاش" },
];

function Page() {
  return (
    <PageShell
      title="AI Voice Rooms"
      subtitle="غرف صوتية ذكية مدعومة بالذكاء الاصطناعي"
      action={<Mic className="h-5 w-5 text-cyan-glow" />}
    >
      <Card className="p-6 bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 border-ice-border mb-6 text-center">
        <Mic className="h-12 w-12 mx-auto mb-3 text-cyan-glow" />
        <h2 className="text-xl font-bold mb-1">ابدأ غرفة صوتية ذكية</h2>
        <p className="text-sm text-muted-foreground mb-4">ادعُ أصدقاءك واستمتع بميزات AI الحصرية</p>
        <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-background">
          <Plus className="h-4 w-4 me-2" /> أنشئ غرفة جديدة
        </Button>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4">
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
