import { useEffect, useRef, useState, useCallback, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Sparkles, User as UserIcon, Share2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export function AiChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (resp.status === 429) {
        toast.error("تم تجاوز الحد المسموح، حاول بعد قليل");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("نفد رصيد AI، يرجى إضافة رصيد");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";
      let done = false;

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
            );
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsertAssistant(c);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل الاتصال بـ AI");
    } finally {
      setLoading(false);
    }
  }

  const shareConversation = useCallback(async () => {
    if (messages.length === 0) return;
    const text = messages
      .map((m) => `${m.role === "user" ? "👤" : "🤖"} ${m.content}`)
      .join("\n\n");
    const shareText = `💬 محادثتي مع HN-Chat AI:\n\n${text.slice(0, 800)}${text.length > 800 ? "\n..." : ""}\n\n🔗 جرّب بنفسك: https://www.hn-chat.com`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "محادثة HN-Chat AI", text: shareText });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(shareText);
    toast.success("تم نسخ المحادثة — شاركها مع أصدقائك!");
  }, [messages]);

  return (
    <Card className="bg-ice-card border-ice-border flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      {/* Share bar */}
      {messages.length > 0 && (
        <div className="flex items-center justify-end px-4 pt-3 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={shareConversation}
            className="text-xs gap-1.5 text-cyan-glow hover:bg-cyan-glow/10"
          >
            <Share2 className="h-3.5 w-3.5" />
            مشاركة المحادثة
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-violet-glow" />
            <p className="text-sm">اسأل الـ AI أي شيء — برمجة، أفكار، ترجمة، تلخيص...</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
          >
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                m.role === "user"
                  ? "bg-cyan-glow/20 text-cyan-glow border-cyan-glow/40"
                  : "bg-violet-glow/20 text-violet-glow border-violet-glow/40",
              )}
            >
              {m.role === "user" ? (
                <UserIcon className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2 text-sm border",
                m.role === "user"
                  ? "bg-cyan-glow/10 border-cyan-glow/30"
                  : "bg-ice-border/30 border-ice-border",
              )}
            >
              <div className="prose prose-sm prose-invert max-w-none break-words [&_p]:my-1 [&_pre]:bg-black/40 [&_pre]:p-2 [&_pre]:rounded [&_code]:text-cyan-glow [&_a]:text-cyan-glow">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content || "..."}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-violet-glow" />
            <span>الـ AI يفكر...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-ice-border flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e as unknown as FormEvent);
            }
          }}
          placeholder="اكتب رسالتك..."
          rows={2}
          disabled={loading}
          className="bg-ice-bg border-ice-border resize-none"
        />
        <Button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-violet-glow/20 hover:bg-violet-glow/30 text-violet-glow border border-violet-glow/40 self-end"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </Card>
  );
}
