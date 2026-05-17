import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Video, Sparkles, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/collab-reels")({
  head: () => ({
    meta: [
      { title: "Collab Reels — hnChat" },
      { name: "description", content: "اصنع Reels مشترك مع صانع محتوى آخر — انتشار مضاعف." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell
      title="Collab Reels"
      subtitle="فيديو مشترك بين صانعين — انتشار مضاعف"
      action={<Users className="h-5 w-5 text-cyan-glow" />}
    >
      <Card className="p-6 bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 border-ice-border mb-6 text-center">
        <Users className="h-12 w-12 mx-auto mb-3 text-cyan-glow" />
        <h2 className="text-xl font-bold mb-1">ابدأ تعاوناً جديداً</h2>
        <p className="text-sm text-muted-foreground mb-4">ادعُ منشئاً آخر لصنع فيديو مشترك (Duet / Split)</p>
        <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-background">
          <Plus className="h-4 w-4 me-2" /> دعوة شريك
        </Button>
      </Card>

      <h2 className="text-lg font-bold mb-3">كيف يعمل</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { i: Video, t: "1. سجّل جزءك", d: "صوّر فيديو 15-60 ثانية" },
          { i: Users, t: "2. ادعُ شريكاً", d: "اختر منشئاً من قائمتك" },
          { i: Sparkles, t: "3. AI يدمج", d: "تركيب تلقائي بتأثيرات احترافية" },
        ].map((s) => {
          const Icon = s.i;
          return (
            <Card key={s.t} className="p-4 bg-ice-card border-ice-border">
              <Icon className="h-6 w-6 text-cyan-glow mb-2" />
              <h3 className="font-bold mb-1">{s.t}</h3>
              <p className="text-xs text-muted-foreground">{s.d}</p>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
