import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Loader2, Sparkles, Download } from "lucide-react";
import { toast } from "sonner";

export function AiImageGen() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ prompt: string; url: string }[]>([]);

  async function generate(e: FormEvent) {
    e.preventDefault();
    const p = prompt.trim();
    if (!p || loading) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-image", {
        body: { prompt: p },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.image) throw new Error("لم يتم استلام أي صورة");
      setHistory((h) => [{ prompt: p, url: data.image }, ...h]);
      setPrompt("");
    } catch (err: any) {
      toast.error(err?.message || "فشل توليد الصورة");
    } finally {
      setLoading(false);
    }
  }

  function download(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.png`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <Card className="bg-ice-card border-ice-border p-4">
        <form onSubmit={generate} className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="صف الصورة التي تريد توليدها... مثل: قطة فضائية تشرب القهوة في حديقة نيون"
            rows={3}
            disabled={loading}
            className="bg-ice-bg border-ice-border resize-none"
          />
          <Button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="w-full bg-violet-glow/20 hover:bg-violet-glow/30 text-violet-glow border border-violet-glow/40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري التوليد...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> ولِّد الصورة
              </>
            )}
          </Button>
        </form>
      </Card>

      {history.length === 0 ? (
        <Card className="bg-ice-card border-ice-border p-12 text-center">
          <ImageIcon className="h-10 w-10 mx-auto mb-3 text-violet-glow" />
          <p className="text-sm text-muted-foreground">
            ستظهر صورك المُولَّدة هنا
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {history.map((item, i) => (
            <Card
              key={i}
              className="bg-ice-card border-ice-border overflow-hidden group relative"
            >
              <img
                src={item.url}
                alt={item.prompt}
                className="w-full aspect-square object-cover"
              />
              <div className="p-3 space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.prompt}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => download(item.url, `ai-image-${i}`)}
                  className="w-full text-cyan-glow hover:bg-cyan-glow/10"
                >
                  <Download className="h-3 w-3 mr-1" /> تنزيل
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
