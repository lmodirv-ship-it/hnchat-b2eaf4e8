import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { AiPromptCard } from "@/components/ai/AiPromptCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Type, FileText, Hash, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ai-video-assistant")({
  head: () => ({
    meta: [
      { title: "AI Video Assistant — hnChat" },
      { name: "description", content: "ولّد عنواناً ووصفاً وهاشتاجات و Thumbnail لفيديوهاتك بمساعدة الذكاء الاصطناعي." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell
      title="AI Video Assistant"
      subtitle="مساعدك الذكي لصناعة فيديو ناجح من العنوان حتى الـ Thumbnail"
      action={<Video className="h-5 w-5 text-cyan-glow" />}
    >
      <Tabs defaultValue="title" className="w-full">
        <TabsList className="bg-ice-card border border-ice-border mb-4 flex-wrap h-auto">
          <TabsTrigger value="title"><Type className="h-4 w-4 me-1" /> عنوان</TabsTrigger>
          <TabsTrigger value="desc"><FileText className="h-4 w-4 me-1" /> وصف</TabsTrigger>
          <TabsTrigger value="tags"><Hash className="h-4 w-4 me-1" /> هاشتاجات</TabsTrigger>
          <TabsTrigger value="thumb"><ImageIcon className="h-4 w-4 me-1" /> Thumbnail</TabsTrigger>
        </TabsList>

        <TabsContent value="title">
          <AiPromptCard
            placeholder="صف موضوع الفيديو (مثال: شرح كيفية البدء في تعلم البرمجة لعام 2026)"
            systemPrompt="أنت خبير تسويق محتوى عربي. اقترح 5 عناوين جذابة قصيرة لفيديو يوتيوب/Reels بالعربية فقط. كل عنوان أقل من 60 حرف."
            buttonLabel="اقترح عناوين جذابة"
          />
        </TabsContent>
        <TabsContent value="desc">
          <AiPromptCard
            placeholder="صف موضوع الفيديو بإيجاز…"
            systemPrompt="اكتب وصفاً احترافياً لفيديو بالعربية: مقدمة قصيرة + النقاط الرئيسية كقائمة + CTA + 5 هاشتاجات في النهاية."
            buttonLabel="ولّد الوصف"
          />
        </TabsContent>
        <TabsContent value="tags">
          <AiPromptCard
            placeholder="صف محتوى الفيديو…"
            systemPrompt="اقترح 15 هاشتاج عربي/إنجليزي ذات صلة عالية لتعزيز انتشار الفيديو. أعدها مفصولة بمسافات تبدأ بـ # فقط."
            buttonLabel="ولّد الهاشتاجات"
          />
        </TabsContent>
        <TabsContent value="thumb">
          <AiPromptCard
            placeholder="صف الفيديو لإنشاء وصف Thumbnail قوي…"
            systemPrompt="اقترح فكرة Thumbnail جذابة: العناصر البصرية، الألوان، النص المختصر على الصورة، والإحساس العام. أعد الإجابة بالعربية."
            buttonLabel="اقترح فكرة Thumbnail"
          />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
