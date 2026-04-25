import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Globe, Sparkles, Check, Store } from "lucide-react";
import { toast } from "sonner";
import {
  scrapeBySiteName,
  type ScrapedListItem,
} from "@/utils/scrape-product.functions";

export function QuickSiteImportDialog({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [site, setSite] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [items, setItems] = useState<ScrapedListItem[]>([]);
  const [siteName, setSiteName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function reset() {
    setSite("");
    setItems([]);
    setSiteName("");
    setSelected(new Set());
  }

  async function onScan(e: FormEvent) {
    e.preventDefault();
    if (!site.trim()) return;
    setLoading(true);
    setItems([]);
    setSelected(new Set());
    try {
      const res = await scrapeBySiteName({ data: { site: site.trim() } });
      setItems(res.items);
      setSiteName(res.siteName);
      setSelected(new Set(res.items.map((i) => i.url)));
      if (res.items.length === 0) {
        toast.error(
          `لم نجد منتجات في ${res.siteName}. جرّب رابط صفحة المنتجات مباشرةً عبر "استيراد من رابط".`
        );
      } else {
        toast.success(`تم العثور على ${res.items.length} منتج من ${res.siteName}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل جلب المنتجات");
    } finally {
      setLoading(false);
    }
  }

  function toggle(url: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(url)) n.delete(url);
      else n.add(url);
      return n;
    });
  }

  async function onImport() {
    if (!user) {
      toast.error("سجّل الدخول أولاً");
      return;
    }
    const chosen = items.filter((i) => selected.has(i.url));
    if (chosen.length === 0) {
      toast.error("اختر منتجاً واحداً على الأقل");
      return;
    }
    setImporting(true);
    try {
      const rows = chosen.map((i) => ({
        seller_id: user.id,
        title: i.title || "Untitled product",
        description: `مستورد من ${siteName}\n${i.url}`,
        price: i.price ?? 0,
        currency: i.currency || "USD",
        images: i.image ? [i.image] : [],
        category: siteName,
        stock: 0,
        is_active: true,
      }));
      const { error } = await supabase.from("products").insert(rows);
      if (error) throw error;
      toast.success(`تم استيراد ${rows.length} منتج`);
      setOpen(false);
      reset();
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الاستيراد");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Sparkles className="size-4" />
          استيراد من اسم الموقع
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="size-5" />
            استيراد سريع من موقع تجاري
          </DialogTitle>
          <DialogDescription>
            اكتب اسم الموقع فقط (مثلاً: <code className="text-foreground">nike</code> أو{" "}
            <code className="text-foreground">allbirds.com</code>) وسنجلب المنتجات تلقائياً.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onScan} className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="nike  أو  allbirds.com"
              className="pl-9"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading || !site.trim()}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : "بحث"}
          </Button>
        </form>

        {items.length > 0 && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {selected.size} / {items.length} محدد من {siteName}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected(new Set(items.map((i) => i.url)))}
                >
                  تحديد الكل
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected(new Set())}
                >
                  مسح
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[45vh] overflow-y-auto pr-1">
              {items.map((i) => {
                const isSel = selected.has(i.url);
                return (
                  <button
                    type="button"
                    key={i.url}
                    onClick={() => toggle(i.url)}
                    className={`relative text-left rounded-lg border overflow-hidden transition-all ${
                      isSel
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {i.image ? (
                      <img
                        src={i.image}
                        alt={i.title}
                        className="w-full aspect-square object-cover bg-muted"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground">
                        <Globe className="size-8" />
                      </div>
                    )}
                    {isSel && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="size-3" />
                      </div>
                    )}
                    <div className="p-2 space-y-1">
                      <div className="text-xs font-medium line-clamp-2">
                        {i.title || "بدون عنوان"}
                      </div>
                      {i.price != null && (
                        <div className="text-xs text-primary font-semibold">
                          {i.price} {i.currency}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              onClick={onImport}
              disabled={importing || selected.size === 0}
              className="w-full"
              size="lg"
            >
              {importing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>استيراد {selected.size} منتج إلى متجري</>
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
