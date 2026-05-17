import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Upload, Sparkles, Captions, Zap } from "lucide-react";
import { AiPromptCard } from "@/components/ai/AiPromptCard";

export const Route = createFileRoute("/_authenticated/shorts-maker")({
  head: () => ({
    meta: [
      { title: "تحويل فيديو طويل إلى Shorts — hnChat" },
      { name: "description", content: "AI يقتطع أفضل اللحظات من فيديو طويل وينشئ Shorts تلقائياً مع ترجمة." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell
      title="Long → Shorts"
      subtitle="حوّل فيديوهاتك الطويلة إلى Shorts منتشرة بالذكاء الاصطناعي"
      action={<Scissors className="h-5 w-5 text-cyan-glow" />}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 bg-ice-card border-ice-border">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="h-5 w-5 text-cyan-glow" />
            <h3 className="font-bold">ارفع الفيديو الطويل</h3>
          </div>
          <Input type="file" accept="video/*" className="bg-background/40" />
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-cyan-glow" /> اقتطاع أفضل اللحظات</div>
            <div className="flex items-center gap-2"><Captions className="h-4 w-4 text-cyan-glow" /> ترجمة تلقائية (Subtitle)</div>
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-cyan-glow" /> تصدير 3-5 Shorts جاهزة</div>
          </div>
          <Button className="w-full mt-4 bg-gradient-to-r from-cyan-glow to-violet-glow text-background">
            <Sparkles className="h-4 w-4 me-2" /> ابدأ المعالجة (قريباً)
          </Button>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">المعالجة الفعلية للفيديو تتطلب خدمة معالجة سحابية — يتم تجهيزها.</p>
        </Card>

        <AiPromptCard
          placeholder="الصق نص الفيديو أو نسخة Transcript…"
          systemPrompt="أنت محرر فيديو محترف. حدد 3-5 لحظات قوية يمكن قطعها كـ Shorts من النص. لكل لحظة: العنوان المقترح، وقت البداية والنهاية، وسبب جاذبيتها."
          buttonLabel="اقترح أفضل المقاطع"
        />
      </div>
    </PageShell>
  );
}
