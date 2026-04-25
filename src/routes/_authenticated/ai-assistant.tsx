import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ComingSoon } from "@/components/ComingSoon";
import { Cpu } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ai-assistant")({
  component: () => (
    <PageShell
      title="AI Assistant"
      subtitle="مساعد ذكي شخصي يتذكّر سياقك"
      action={
        <Link
          to="/ai-hub"
          className="text-xs px-3 py-1.5 rounded-lg bg-violet-glow/15 text-violet-glow border border-violet-glow/40 hover:bg-violet-glow/25 transition"
        >
          فتح AI Hub →
        </Link>
      }
    >
      <ComingSoon
        icon={Cpu}
        title="مساعدك الذكي الشخصي 🧠"
        description="مساعد AI يتعلّم من تفاعلاتك، يلخّص محادثاتك، يقترح ردوداً، ويذكّرك بالمهام."
        features={[
          "ذاكرة طويلة المدى لتفضيلاتك",
          "ملخّصات يومية لمحادثاتك",
          "اقتراحات ردود ذكية",
          "تذكير بالمهام والمواعيد",
        ]}
      />
    </PageShell>
  ),
});
