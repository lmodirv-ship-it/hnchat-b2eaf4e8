import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, MessageCircle, Send } from "lucide-react";
import { AiPromptCard } from "@/components/ai/AiPromptCard";

export const Route = createFileRoute("/_authenticated/ai-avatar")({
  head: () => ({
    meta: [
      { title: "AI Avatar — hnChat" },
      { name: "description", content: "أنشئ شخصية AI تتكلم وترد وتنشر باسمك." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell
      title="AI Avatar"
      subtitle="شخصيتك الذكية: تتكلم، ترد، وتنشر بأسلوبك"
      action={<Bot className="h-5 w-5 text-cyan-glow" />}
    >
      <Card className="p-6 bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 border-ice-border mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center">
            <Bot className="h-10 w-10 text-background" />
          </div>
          <div>
            <h2 className="text-xl font-bold">شخصيتك لم تُنشأ بعد</h2>
            <p className="text-sm text-muted-foreground">ابدأ بتعريف أسلوبك وشخصيتك</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-background">
          <Sparkles className="h-4 w-4 me-2" /> أنشئ شخصيتي
        </Button>
      </Card>

      <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><MessageCircle className="h-4 w-4" /> جرّب الرد بأسلوبك</h2>
      <AiPromptCard
        placeholder="اكتب شخصيتك (مثال: شاب طموح يحب التقنية وأسلوبه ودود ومرح)…"
        systemPrompt="أنت تساعد المستخدم في توليد رد قصير على منشور بأسلوب الشخصية المعطاة. أعد رداً واحداً مختصراً يبدو طبيعياً وشخصياً."
        buttonLabel="ولّد رداً بشخصيتي"
      />
    </PageShell>
  );
}
