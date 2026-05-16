import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CatalogItem } from "@/hooks/useCatalog";

export const Route = createFileRoute("/_authenticated/ai-assistant")({
  head: () => ({
    meta: [
      { title: "المساعد الذكي — hnChat AI" },
      { name: "description", content: "تحدّث مع المساعد الذكي على HN-Chat. بوت دردشة AI عربي يساعدك في البرمجة، الترجمة، التلخيص، وأكثر." },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "ai-assistant:history";

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]") as Msg[]; }
    catch { return []; }
  });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setStreaming(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: next.map((m) => ({ role: m.role, content: m.content })) },
      });
      if (error) throw error;
      const reply = (data as { reply?: string; content?: string })?.reply
                  ?? (data as { reply?: string; content?: string })?.content
                  ?? "تعذّر الحصول على رد.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error((e as Error).message);
      setMessages((m) => [...m, { role: "assistant", content: "حدث خطأ، جرّب مرة أخرى." }]);
    } finally {
      setStreaming(false);
    }
  };

  const usePreset = (item: CatalogItem) => {
    const meta = (item.metadata ?? {}) as { preset?: string };
    const prompt = meta.preset === "social_post" ? "اكتب لي منشوراً جذّاباً عن: "
      : meta.preset === "translator" ? "ترجم النص التالي إلى الإنجليزية: "
      : meta.preset === "resume" ? "حسّن هذه السيرة الذاتية: "
      : `استخدم أداة ${item.title} على: `;
    setInput(prompt);
    document.querySelector<HTMLInputElement>("#ai-input")?.focus();
  };

  return (
    <PageShell title="AI Assistant" subtitle="مساعدك الذكي بدعم الذكاء الاصطناعي">
      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        <Card className="bg-ice-card border-ice-border flex flex-col h-[600px]">
          <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-glow/30 to-pink-glow/20 border border-violet-glow/40 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-violet-glow" />
                </div>
                <p className="text-sm">اطرح سؤالاً أو اختر أداة من اليمين</p>
              </div>
            ) : messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg bg-violet-glow/20 border border-violet-glow/40 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-violet-glow" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-cyan-glow/20 to-violet-glow/15 border border-cyan-glow/30"
                    : "bg-ice-bg/60 border border-ice-border"
                }`}>{m.content}</div>
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-lg bg-cyan-glow/20 border border-cyan-glow/40 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-cyan-glow" />
                  </div>
                )}
              </div>
            ))}
            {streaming && (
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-glow/20 border border-violet-glow/40 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-violet-glow animate-pulse" />
                </div>
                <div className="rounded-2xl px-3 py-2 bg-ice-bg/60 border border-ice-border text-xs text-muted-foreground">يفكّر...</div>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="p-3 border-t border-ice-border flex items-center gap-2"
          >
            <Input
              id="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك..."
              disabled={streaming}
            />
            <Button type="submit" disabled={streaming || !input.trim()} className="gap-1">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <div>
          <h3 className="text-sm font-semibold mb-3">أدوات AI</h3>
          <CatalogGrid
            type="ai_tool"
            cardIcon={Bot}
            ctaLabel="استخدم"
            accent="violet"
            showCategories={false}
            emptyText="لا توجد أدوات"
            onAction={usePreset}
          />
        </div>
      </div>
    </PageShell>
  );
}
