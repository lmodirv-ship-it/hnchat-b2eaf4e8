import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { GraduationCap, Code, Palette, Cpu, Play } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mini-courses")({
  head: () => ({
    meta: [
      { title: "Mini Courses — hnChat" },
      { name: "description", content: "دورات قصيرة بنظام Reels: AI، برمجة، تصميم." },
    ],
  }),
  component: Page,
});

const COURSES = [
  { icon: Cpu, title: "أساسيات الذكاء الاصطناعي", lessons: 12, color: "oklch(0.78 0.18 220)" },
  { icon: Code, title: "البرمجة من الصفر", lessons: 24, color: "oklch(0.7 0.2 160)" },
  { icon: Palette, title: "تصميم UI/UX", lessons: 18, color: "oklch(0.72 0.22 340)" },
  { icon: Cpu, title: "Prompt Engineering", lessons: 8, color: "oklch(0.65 0.25 295)" },
];

function Page() {
  return (
    <PageShell
      title="Mini Courses"
      subtitle="تعلّم سريع بأسلوب Reels — دروس قصيرة وفعّالة"
      action={<GraduationCap className="h-5 w-5 text-cyan-glow" />}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {COURSES.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="p-5 bg-ice-card border-ice-border hover:border-cyan-glow/40 transition cursor-pointer group">
              <Icon className="h-8 w-8 mb-3" style={{ color: c.color }} />
              <h3 className="font-bold mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{c.lessons} درساً قصيراً</p>
              <div className="flex items-center gap-2 text-xs text-cyan-glow group-hover:gap-3 transition-all">
                <Play className="h-3 w-3" /> ابدأ التعلّم
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
