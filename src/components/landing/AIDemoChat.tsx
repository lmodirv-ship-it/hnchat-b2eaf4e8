import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";

const DEMO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/demo-chat`;

interface DemoMsg {
  role: "user" | "assistant";
  content: string;
}

const placeholders: Record<string, string> = {
  ar: "اسأل الذكاء الاصطناعي أي سؤال...",
  en: "Ask AI anything...",
  fr: "Posez une question à l'IA...",
  es: "Pregunta lo que quieras a la IA...",
  de: "Frag die KI was du willst...",
  tr: "Yapay zekaya bir şey sor...",
  pt: "Pergunte qualquer coisa à IA...",
  zh: "向AI提问任何问题...",
  ru: "Задайте ИИ любой вопрос...",
};

const signupTexts: Record<string, { title: string; desc: string; btn: string }> = {
  ar: { title: "أعجبك ذكاء hnChat؟", desc: "سجّل الآن لتكمل الرحلة مجاناً — محادثات غير محدودة!", btn: "سجّل مجاناً" },
  en: { title: "Impressed by hnChat AI?", desc: "Sign up now for unlimited conversations — it's free!", btn: "Sign Up Free" },
  fr: { title: "Impressionné par hnChat AI ?", desc: "Inscrivez-vous pour des conversations illimitées — c'est gratuit !", btn: "S'inscrire" },
  es: { title: "¿Te impresionó hnChat AI?", desc: "Regístrate para conversaciones ilimitadas — ¡es gratis!", btn: "Registrarse" },
  de: { title: "Beeindruckt von hnChat AI?", desc: "Registriere dich für unbegrenzte Gespräche — kostenlos!", btn: "Kostenlos registrieren" },
  tr: { title: "hnChat AI'dan etkilendiniz mi?", desc: "Sınırsız sohbet için kaydolun — ücretsiz!", btn: "Ücretsiz Kaydol" },
  pt: { title: "Impressionado com o hnChat AI?", desc: "Cadastre-se para conversas ilimitadas — é grátis!", btn: "Cadastrar Grátis" },
  zh: { title: "对hnChat AI印象深刻？", desc: "注册即可无限对话——完全免费！", btn: "免费注册" },
  ru: { title: "Впечатлены hnChat AI?", desc: "Зарегистрируйтесь для неограниченных бесед — бесплатно!", btn: "Зарегистрироваться" },
};

export function AIDemoChat({ lang = "en" }: { lang: string }) {
  const [messages, setMessages] = useState<DemoMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasUsedDemo, setHasUsedDemo] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    if (hasUsedDemo) {
      setShowSignup(true);
      return;
    }

    const userMsg: DemoMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    let assistantContent = "";

    try {
      const resp = await fetch(DEMO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ message: userMsg.content }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to connect");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            // partial json, wait for more
          }
        }
      }
    } catch (e) {
      console.error("Demo chat error:", e);
      assistantContent = lang === "ar"
        ? "عذراً، حدث خطأ. حاول مرة أخرى."
        : "Sorry, something went wrong. Try again.";
      setMessages((prev) => [
        ...prev.slice(0, -1).filter(m => m.role !== "assistant" || m.content),
        { role: "assistant", content: assistantContent },
      ]);
    }

    setIsStreaming(false);
    setHasUsedDemo(true);
  };

  const sText = signupTexts[lang] || signupTexts.en;
  const ph = placeholders[lang] || placeholders.en;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-3xl border border-ice-border/20 bg-ice-card/5 backdrop-blur-2xl shadow-[0_8px_60px_oklch(0_0_0/0.4),0_0_80px_oklch(0.78_0.18_220/0.06)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ice-border/15 bg-gradient-to-r from-cyan-glow/5 to-violet-glow/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20">
              <Bot className="h-5 w-5 text-cyan-glow" />
            </div>
            <div>
              <span className="text-sm font-bold">hnChat AI</span>
              <span className="block text-[10px] text-muted-foreground/60">
                {lang === "ar" ? "جرّب مجاناً" : lang === "fr" ? "Essai gratuit" : "Free trial"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={chatRef} className="h-64 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: "none" }}>
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground/40">
                <Sparkles className="h-8 w-8 mx-auto mb-3 text-cyan-glow/30" />
                <p className="text-sm">{lang === "ar" ? "اسأل أي شيء — جرّب الذكاء الآن!" : lang === "fr" ? "Posez une question — testez l'IA !" : "Ask anything — try the AI now!"}</p>
              </div>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`shrink-0 p-1.5 rounded-lg ${m.role === "user" ? "bg-violet-glow/20" : "bg-cyan-glow/20"}`}>
                  {m.role === "user" ? <User className="h-4 w-4 text-violet-glow" /> : <Bot className="h-4 w-4 text-cyan-glow" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-violet-glow/15 to-pink-glow/10 border border-violet-glow/15"
                    : "bg-gradient-to-br from-cyan-glow/10 to-violet-glow/5 border border-cyan-glow/10"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                      <ReactMarkdown>{m.content || "●"}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{m.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isStreaming && (
            <div className="flex items-center gap-1.5 text-cyan-glow/50 text-xs px-2">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
              <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
            </div>
          )}
        </div>

        {/* Signup overlay */}
        <AnimatePresence>
          {showSignup && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-5 py-5 border-t border-cyan-glow/20 bg-gradient-to-r from-cyan-glow/5 to-violet-glow/5"
            >
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-cyan-glow shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold mb-1">{sText.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{sText.desc}</p>
                  <Link to="/sign-up-login">
                    <button className="px-5 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground shadow-[0_4px_20px_oklch(0.78_0.18_220/0.4)] hover:shadow-[0_6px_30px_oklch(0.78_0.18_220/0.6)] hover:scale-[1.05] transition-all duration-300 cursor-pointer">
                      {sText.btn}
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        {!showSignup && (
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="px-4 py-3 border-t border-ice-border/15 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={ph}
              disabled={isStreaming}
              className="flex-1 bg-ice-card/10 backdrop-blur-xl rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 border border-ice-border/15 focus:border-cyan-glow/40 focus:outline-none focus:shadow-[0_0_20px_oklch(0.78_0.18_220/0.1)] transition-all duration-300 disabled:opacity-50"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground shadow-[0_4px_15px_oklch(0.78_0.18_220/0.3)] hover:shadow-[0_6px_25px_oklch(0.78_0.18_220/0.5)] hover:scale-[1.05] transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
