import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * useAiText — استدعاء دالة ai-chat لتوليد نص واحد (non-stream).
 * يجمع تدفق SSE في نص واحد ثم يعيده.
 */
export function useAiText() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  async function generate(prompt: string, system?: string): Promise<string> {
    setLoading(true);
    setText("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error("سجّل الدخول أولاً");
        return "";
      }
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const messages = [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt },
      ];
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok || !res.body) {
        toast.error("فشل توليد النص");
        return "";
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const l = line.trim();
          if (!l.startsWith("data:")) continue;
          const payload = l.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              acc += delta;
              setText(acc);
            }
          } catch {
            /* ignore */
          }
        }
      }
      return acc;
    } catch (e: any) {
      toast.error(e?.message ?? "خطأ غير متوقع");
      return "";
    } finally {
      setLoading(false);
    }
  }

  return { generate, loading, text, setText };
}
