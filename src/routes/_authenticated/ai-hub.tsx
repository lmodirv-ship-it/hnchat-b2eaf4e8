import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, ImageIcon } from "lucide-react";
import { AiChat } from "@/components/ai/AiChat";
import { AiImageGen } from "@/components/ai/AiImageGen";

export const Route = createFileRoute("/_authenticated/ai-hub")({
  component: AiHubPage,
});

function AiHubPage() {
  return (
    <PageShell
      title="AI Hub"
      subtitle="مساعد ذكي + توليد صور بقدرات الذكاء الاصطناعي"
    >
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="bg-ice-card border border-ice-border mb-4">
          <TabsTrigger value="chat" className="data-[state=active]:bg-violet-glow/20 data-[state=active]:text-violet-glow">
            <MessageSquare className="h-4 w-4 mr-1" /> دردشة
          </TabsTrigger>
          <TabsTrigger value="image" className="data-[state=active]:bg-violet-glow/20 data-[state=active]:text-violet-glow">
            <ImageIcon className="h-4 w-4 mr-1" /> توليد صور
          </TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <AiChat />
        </TabsContent>
        <TabsContent value="image">
          <AiImageGen />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
