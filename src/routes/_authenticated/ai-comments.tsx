import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiPromptCard } from "@/components/ai/AiPromptCard";
import { MessageSquare, Smile, Briefcase, Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ai-comments")({
  head: () => ({
    meta: [
      { title: "AI Comments — hnChat" },
      { name: "description", content: "اقتراح ردود ذكية لتعليقاتك بالعربية: محترم، مضحك، أو احترافي." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell
      title="AI Comments"
      subtitle="اقتراح ردود ذكية لأي تعليق"
      action={<MessageSquare className="h-5 w-5 text-cyan-glow" />}
    >
      <Tabs defaultValue="respect">
        <TabsList className="bg-ice-card border border-ice-border mb-4">
          <TabsTrigger value="respect"><Heart className="h-4 w-4 me-1" /> محترم</TabsTrigger>
          <TabsTrigger value="funny"><Smile className="h-4 w-4 me-1" /> مضحك</TabsTrigger>
          <TabsTrigger value="pro"><Briefcase className="h-4 w-4 me-1" /> احترافي</TabsTrigger>
        </TabsList>
        <TabsContent value="respect">
          <AiPromptCard
            placeholder="الصق التعليق الذي تريد الرد عليه…"
            systemPrompt="أنت تساعد المستخدم على الرد بأسلوب محترم وراقي بالعربية. اقترح 3 ردود قصيرة لطيفة."
            buttonLabel="اقترح ردوداً محترمة"
          />
        </TabsContent>
        <TabsContent value="funny">
          <AiPromptCard
            placeholder="الصق التعليق…"
            systemPrompt="اقترح 3 ردود قصيرة مضحكة وذكية بالعربية، بدون إساءة، مع روح خفيفة."
            buttonLabel="اقترح ردوداً مضحكة"
          />
        </TabsContent>
        <TabsContent value="pro">
          <AiPromptCard
            placeholder="الصق التعليق…"
            systemPrompt="اقترح 3 ردود احترافية رسمية بالعربية تليق ببيئة العمل وصناع المحتوى."
            buttonLabel="اقترح ردوداً احترافية"
          />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
