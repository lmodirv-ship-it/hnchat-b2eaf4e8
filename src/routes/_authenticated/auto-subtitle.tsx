import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Captions, Upload, Languages } from "lucide-react";
import { AiPromptCard } from "@/components/ai/AiPromptCard";

export const Route = createFileRoute("/_authenticated/auto-subtitle")({
  head: () => ({
    meta: [
      { title: "Auto Subtitle — hnChat" },
      { name: "description", content: "ترجمة تلقائية لفيديوهاتك بالعربية والإنجليزية والفرنسية." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell
      title="Auto Subtitle"
      subtitle="ترجمة تلقائية تضاعف انتشار محتواك عالمياً"
      action={<Captions className="h-5 w-5 text-cyan-glow" />}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 bg-ice-card border-ice-border">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="h-5 w-5 text-cyan-glow" />
            <h3 className="font-bold">ارفع الفيديو</h3>
          </div>
          <Input type="file" accept="video/*" className="bg-background/40 mb-3" />
          <div className="flex flex-wrap gap-2 mb-3">
            {["العربية", "English", "Français"].map((l) => (
              <span key={l} className="px-3 py-1 rounded-full text-xs bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow flex items-center gap-1">
                <Languages className="h-3 w-3" /> {l}
              </span>
            ))}
          </div>
          <Button className="w-full bg-gradient-to-r from-cyan-glow to-violet-glow text-background">
            استخرج الترجمة (قريباً)
          </Button>
        </Card>

        <AiPromptCard
          placeholder="الصق نص الفيديو لترجمته…"
          systemPrompt="ترجم النص إلى الإنجليزية والفرنسية. أعد النتيجة بصيغة: 🇸🇦 [العربي] / 🇬🇧 [الإنجليزي] / 🇫🇷 [الفرنسي] لكل سطر."
          buttonLabel="ترجم النص"
        />
      </div>
    </PageShell>
  );
}
