import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Sparkles, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/_authenticated/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges — hnChat" },
      { name: "description", content: "انضم لتحديات أسبوعية وأظهر إبداعك." },
    ],
  }),
  component: Page,
});

const CHALLENGES = [
  { icon: Calendar, title: "🔥 تحدي 7 أيام", desc: "انشر يومياً لمدة أسبوع", participants: 248, color: "oklch(0.78 0.18 220)" },
  { icon: Sparkles, title: "🔥 أفضل فيديو AI", desc: "أبدع باستخدام أدوات AI", participants: 132, color: "oklch(0.65 0.25 295)" },
  { icon: Lightbulb, title: "🔥 أفضل حكمة", desc: "شارك حكمة تلهم الآخرين", participants: 89, color: "oklch(0.7 0.2 160)" },
];

function Page() {
  return (
    <PageShell
      title="Challenges"
      subtitle="انضم للتحديات الأسبوعية واكسب جوائز"
      action={<Trophy className="h-5 w-5 text-amber-400" />}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHALLENGES.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="p-5 bg-ice-card border-ice-border hover:border-cyan-glow/40 transition">
              <Icon className="h-8 w-8 mb-3" style={{ color: c.color }} />
              <h3 className="font-bold mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{c.desc}</p>
              <p className="text-xs text-cyan-glow mb-3">{c.participants} مشارك</p>
              <Button size="sm" className="w-full bg-gradient-to-r from-cyan-glow to-violet-glow text-background">انضم الآن</Button>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
