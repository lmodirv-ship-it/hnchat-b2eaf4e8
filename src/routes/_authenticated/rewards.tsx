import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Eye, Share2, UserPlus, Award } from "lucide-react";

export const Route = createFileRoute("/_authenticated/rewards")({
  head: () => ({
    meta: [
      { title: "نظام المكافآت — hnChat" },
      { name: "description", content: "اكسب نقاط وشارات ورتب على نشاطك في hnChat." },
    ],
  }),
  component: Page,
});

const ACTIONS = [
  { icon: Eye, label: "كل 100 مشاهدة", points: 10 },
  { icon: Share2, label: "كل منشور جديد", points: 25 },
  { icon: UserPlus, label: "كل دعوة مقبولة", points: 50 },
  { icon: Star, label: "كل إعجاب على محتواك", points: 1 },
];

const BADGES = [
  { name: "مبتدئ", min: 0, color: "oklch(0.6 0.02 250)" },
  { name: "ناشط", min: 100, color: "oklch(0.7 0.2 160)" },
  { name: "محترف", min: 500, color: "oklch(0.78 0.18 220)" },
  { name: "أسطورة", min: 2000, color: "oklch(0.72 0.22 340)" },
];

function Page() {
  const userPoints = 0;
  return (
    <PageShell
      title="المكافآت والنقاط"
      subtitle="اكسب نقاطاً، افتح شارات، وارتقِ في الترتيب"
      action={<Trophy className="h-5 w-5 text-amber-400" />}
    >
      <Card className="p-6 bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 border-ice-border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">رصيدك الحالي</p>
            <p className="text-4xl font-black bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">{userPoints}</p>
            <p className="text-xs text-muted-foreground mt-1">نقطة</p>
          </div>
          <Trophy className="h-16 w-16 text-amber-400/40" />
        </div>
      </Card>

      <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Star className="h-4 w-4" /> كيف تربح نقاطاً</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Card key={a.label} className="p-4 bg-ice-card border-ice-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-cyan-glow" />
                <span className="text-sm">{a.label}</span>
              </div>
              <span className="font-bold text-cyan-glow">+{a.points}</span>
            </Card>
          );
        })}
      </div>

      <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Award className="h-4 w-4" /> الشارات</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGES.map((b) => (
          <Card key={b.name} className="p-4 bg-ice-card border-ice-border text-center">
            <Award className="h-8 w-8 mx-auto mb-2" style={{ color: b.color }} />
            <p className="font-bold text-sm">{b.name}</p>
            <p className="text-[11px] text-muted-foreground">{b.min}+ نقطة</p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
