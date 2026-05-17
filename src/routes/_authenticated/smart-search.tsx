import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAiText } from "@/hooks/useAiText";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/smart-search")({
  head: () => ({
    meta: [
      { title: "Smart Search — hnChat" },
      { name: "description", content: "بحث دلالي ذكي: اكتب ما تريده بلغتك، AI يفهم المعنى." },
    ],
  }),
  component: Page,
});

function Page() {
  const [query, setQuery] = useState("");
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { generate } = useAiText();

  async function onSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    const kw = await generate(
      `استخرج 3-5 كلمات مفتاحية فقط من هذا السؤال للبحث: "${query}". أعدها مفصولة بفاصلة، بدون شرح.`,
      "أنت محرك بحث دلالي. أعد كلمات مفتاحية فقط.",
    );
    setKeywords(kw);
    const firstKw = kw.split(/[,،]/)[0]?.trim() || query;
    const { data } = await supabase
      .from("posts")
      .select("id, content, likes_count")
      .ilike("content", `%${firstKw}%`)
      .limit(20);
    setResults(data ?? []);
    setLoading(false);
  }

  return (
    <PageShell
      title="Smart Search"
      subtitle="بحث ذكي يفهم المعنى لا الكلمات فقط"
      action={<Sparkles className="h-5 w-5 text-cyan-glow" />}
    >
      <Card className="p-4 bg-ice-card border-ice-border mb-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="مثال: اعرض فيديوهات عن النجاح وتطوير الذات"
            className="bg-background/40"
          />
          <Button onClick={onSearch} disabled={loading} className="bg-gradient-to-r from-cyan-glow to-violet-glow text-background">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {keywords && <p className="text-xs text-muted-foreground mt-2">🔍 الكلمات المستخرجة: {keywords}</p>}
      </Card>

      <div className="space-y-2">
        {results.map((p) => (
          <Link key={p.id} to="/post/$id" params={{ id: p.id }}>
            <Card className="p-3 bg-ice-card border-ice-border hover:border-cyan-glow/40">
              <p className="text-sm line-clamp-2">{p.content}</p>
              <p className="text-xs text-muted-foreground mt-1">{p.likes_count} إعجاب</p>
            </Card>
          </Link>
        ))}
        {!loading && query && !results.length && keywords && (
          <p className="text-center text-muted-foreground py-8 text-sm">لا توجد نتائج مطابقة</p>
        )}
      </div>
    </PageShell>
  );
}
