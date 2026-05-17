import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { useAiText } from "@/hooks/useAiText";
import { toast } from "sonner";

interface AiPromptCardProps {
  placeholder: string;
  systemPrompt: string;
  buildPrompt?: (input: string) => string;
  buttonLabel?: string;
  /** عناصر إضافية تظهر فوق منطقة الإدخال (مثل رفع ملف). */
  beforeInput?: ReactNode;
}

export function AiPromptCard({
  placeholder,
  systemPrompt,
  buildPrompt,
  buttonLabel = "ولّد بالذكاء الاصطناعي",
  beforeInput,
}: AiPromptCardProps) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const { generate, loading, text } = useAiText();

  async function onRun() {
    if (!input.trim()) {
      toast.error("اكتب وصفاً أولاً");
      return;
    }
    await generate(buildPrompt ? buildPrompt(input) : input, systemPrompt);
  }

  async function onCopy() {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="p-4 sm:p-5 bg-ice-card border-ice-border space-y-3">
      {beforeInput}
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="bg-background/40 border-ice-border"
      />
      <Button
        onClick={onRun}
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-glow to-violet-glow text-background"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin me-2" />
        ) : (
          <Sparkles className="h-4 w-4 me-2" />
        )}
        {buttonLabel}
      </Button>
      {text && (
        <div className="relative rounded-xl border border-ice-border bg-background/40 p-4 whitespace-pre-wrap text-sm leading-relaxed">
          <button
            onClick={onCopy}
            className="absolute top-2 left-2 p-1.5 rounded-md hover:bg-ice-card/80 text-muted-foreground"
            title="نسخ"
          >
            {copied ? <Check className="h-4 w-4 text-cyan-glow" /> : <Copy className="h-4 w-4" />}
          </button>
          {text}
        </div>
      )}
    </Card>
  );
}
