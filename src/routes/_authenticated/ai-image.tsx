import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { AiImageGen } from "@/components/ai/AiImageGen";
import { ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ai-image")({
  head: () => ({
    meta: [
      { title: "AI Image Generator — hnChat" },
      { name: "description", content: "ولّد صوراً فنية احترافية من نص بالذكاء الاصطناعي وانشرها فوراً." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell
      title="AI Image Generator"
      subtitle="اكتب وصفاً — ولّد صورة — انشرها فوراً"
      action={<ImageIcon className="h-5 w-5 text-cyan-glow" />}
    >
      <AiImageGen />
    </PageShell>
  );
}
