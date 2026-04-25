import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Globe, Download, Sparkles, Package, ListTree, Check } from "lucide-react";
import { toast } from "sonner";
import {
  scrapeProductUrl,
  scrapeCategoryUrl,
  type ScrapedProduct,
  type ScrapedListItem,
} from "@/utils/scrape-product.functions";

type Mode = "single" | "multi";

export function ImportProductDialog({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("single");

  // single
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ScrapedProduct | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // multi
  const [catUrl, setCatUrl] = useState("");
  const [catScraping, setCatScraping] = useState(false);
  const [catSaving, setCatSaving] = useState(false);
  const [catItems, setCatItems] = useState<ScrapedListItem[]>([]);
  const [catSelected, setCatSelected] = useState<Set<string>>(new Set());
  const [catSite, setCatSite] = useState("");

  function reset() {
    setUrl(""); setData(null); setTitle(""); setDescription("");
    setPrice(""); setCurrency("USD"); setSelectedImages([]);
    setCatUrl(""); setCatItems([]); setCatSelected(new Set()); setCatSite("");
  }

  async function fetchPreview(e: FormEvent) {
    e.preventDefault();
    if (!url.trim() || scraping) return;
    setScraping(true);
    try {
      const result = await scrapeProductUrl({ data: { url: url.trim() } });
      setData(result);
      setTitle(result.title);
      setDescription(result.description);
      setPrice(result.price != null ? String(result.price) : "");
      setCurrency(result.currency || "USD");
      setSelectedImages(result.images);
      if (!result.title && !result.images.length) {
        toast.warning("لم نتمكن من قراءة بيانات كافية، يمكنك التعديل يدوياً");
      } else {
        toast.success("تم استخراج بيانات المنتج");
      }
    } catch (err: any) {
      toast.error(err?.message || "فشل قراءة الرابط");
    } finally {
      setScraping(false);
    }
  }

  async function saveSingle() {
    if (!user) return;
    const priceNum = parseFloat(price);
    if (!title.trim() || !priceNum || priceNum <= 0) {
      toast.error("يرجى ملء العنوان والسعر");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("products").insert({
        seller_id: user.id,
        title: title.trim(),
        description: (description.trim() || `مستورد من ${data?.siteName || "الويب"}\n${data?.url || ""}`).slice(0, 1000),
        price: priceNum,
        currency,
        category: null,
        stock: 1,
        images: selectedImages,
        is_active: true,
      });
      if (error) throw error;
      toast.success("تمت إضافة المنتج إلى السوق 🎉");
      reset();
      setOpen(false);
      onCreated?.();
    } catch (err: any) {
      toast.error(err?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  function toggleImage(src: string) {
    setSelectedImages((prev) =>
      prev.includes(src) ? prev.filter((i) => i !== src) : [...prev, src]
    );
  }

  async function fetchCategory(e: FormEvent) {
    e.preventDefault();
    if (!catUrl.trim() || catScraping) return;
    setCatScraping(true);
    try {
      const result = await scrapeCategoryUrl({ data: { url: catUrl.trim() } });
      setCatItems(result.items);
      setCatSite(result.siteName);
      setCatSelected(new Set(result.items.map((i) => i.url)));
      if (!result.items.length) toast.warning("لم نجد منتجات في هذه الصفحة");
      else toast.success(`تم اكتشاف ${result.items.length} منتج`);
    } catch (err: any) {
      toast.error(err?.message || "فشل قراءة الصفحة");
    } finally {
      setCatScraping(false);
    }
  }

  function toggleCatItem(url: string) {
    setCatSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  async function saveCategory() {
    if (!user) return;
    const chosen = catItems.filter((i) => catSelected.has(i.url));
    if (!chosen.length) {
      toast.error("اختر منتجاً واحداً على الأقل");
      return;
    }
    setCatSaving(true);
    let imported = 0;
    let failed = 0;
    try {
      for (const it of chosen) {
        try {
          // try to enrich each with details (best-effort)
          let priceNum = it.price;
          let cur = it.currency;
          let images = it.image ? [it.image] : [];
          let desc = "";
          try {
            const detail = await scrapeProductUrl({ data: { url: it.url } });
            if (priceNum == null && detail.price != null) priceNum = detail.price;
            if (detail.currency) cur = detail.currency;
            if (detail.images.length) images = detail.images;
            desc = detail.description || "";
          } catch {}

          if (!it.title || !priceNum || priceNum <= 0) {
            failed++;
            continue;
          }
          const { error } = await supabase.from("products").insert({
            seller_id: user.id,
            title: it.title.slice(0, 200),
            description: (desc || `مستورد من ${catSite}\n${it.url}`).slice(0, 1000),
            price: priceNum,
            currency: cur,
            category: null,
            stock: 1,
            images,
            is_active: true,
          });
          if (error) failed++;
          else imported++;
        } catch {
          failed++;
        }
      }
      if (imported) toast.success(`تم استيراد ${imported} منتج${failed ? ` (تخطّى ${failed})` : ""}`);
      else toast.error("لم يتم استيراد أي منتج");
      if (imported) {
        reset();
        setOpen(false);
        onCreated?.();
      }
    } finally {
      setCatSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-violet-glow/10 hover:bg-violet-glow/20 text-violet-glow border-violet-glow/40">
          <Globe className="h-4 w-4 mr-1" /> استيراد من رابط
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-ice-card border-ice-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-glow" />
            استيراد من موقع إلكتروني
          </DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-ice-bg">
            <TabsTrigger value="single" className="gap-1">
              <Package className="h-4 w-4" /> صفحة منتج
            </TabsTrigger>
            <TabsTrigger value="multi" className="gap-1">
              <ListTree className="h-4 w-4" /> صفحة فئة/متجر
            </TabsTrigger>
          </TabsList>

          {/* SINGLE PRODUCT */}
          <TabsContent value="single" className="space-y-3 mt-3">
            <form onSubmit={fetchPreview} className="flex gap-2">
              <Input
                placeholder="https://example.com/product/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-ice-bg border-ice-border flex-1"
                dir="ltr"
              />
              <Button
                type="submit"
                disabled={scraping || !url.trim()}
                className="bg-violet-glow/20 hover:bg-violet-glow/30 text-violet-glow border border-violet-glow/40"
              >
                {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              نقرأ بيانات المنتج (العنوان، الصور، السعر) من Open Graph / JSON-LD.
            </p>

            {data && (
              <div className="space-y-3 pt-2 border-t border-ice-border">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اسم المنتج" className="bg-ice-bg border-ice-border" />
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="الوصف" className="bg-ice-bg border-ice-border resize-none" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" step="0.01" min="0" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-ice-bg border-ice-border" />
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={4} className="bg-ice-bg border-ice-border" />
                </div>

                {data.images.length > 0 && (
                  <div>
                    <p className="text-xs mb-1 text-muted-foreground">
                      الصور ({selectedImages.length}/{data.images.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {data.images.map((src) => {
                        const active = selectedImages.includes(src);
                        return (
                          <button key={src} type="button" onClick={() => toggleImage(src)}
                            className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${active ? "border-violet-glow" : "border-ice-border opacity-60"}`}>
                            <img src={src} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button type="button" onClick={saveSingle} disabled={saving} className="w-full bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري الإضافة...</> : "إضافة إلى السوق"}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* MULTI / CATEGORY */}
          <TabsContent value="multi" className="space-y-3 mt-3">
            <form onSubmit={fetchCategory} className="flex gap-2">
              <Input
                placeholder="https://example.com/shop/category/..."
                value={catUrl}
                onChange={(e) => setCatUrl(e.target.value)}
                className="bg-ice-bg border-ice-border flex-1"
                dir="ltr"
              />
              <Button
                type="submit"
                disabled={catScraping || !catUrl.trim()}
                className="bg-violet-glow/20 hover:bg-violet-glow/30 text-violet-glow border border-violet-glow/40"
              >
                {catScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              نكتشف منتجات المتجر تلقائياً، ثم نستورد تفاصيل كل منتج تختاره.
            </p>

            {catItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-ice-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {catSelected.size}/{catItems.length} مختار · {catSite}
                  </span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCatSelected(new Set(catItems.map((i) => i.url)))} className="text-cyan-glow hover:underline">الكل</button>
                    <button type="button" onClick={() => setCatSelected(new Set())} className="text-muted-foreground hover:underline">لا شيء</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-1">
                  {catItems.map((it) => {
                    const active = catSelected.has(it.url);
                    return (
                      <button
                        key={it.url}
                        type="button"
                        onClick={() => toggleCatItem(it.url)}
                        className={`relative text-right rounded-lg overflow-hidden border-2 transition-all bg-ice-bg ${active ? "border-violet-glow" : "border-ice-border opacity-70"}`}
                      >
                        <div className="aspect-square bg-ice-bg/50">
                          {it.image ? (
                            <img src={it.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="p-2 text-xs">
                          <div className="line-clamp-2 min-h-[2.2em]">{it.title || "بدون عنوان"}</div>
                          {it.price != null && (
                            <div className="text-cyan-glow font-bold mt-1">{it.price} {it.currency}</div>
                          )}
                        </div>
                        {active && (
                          <div className="absolute top-1 left-1 bg-violet-glow text-white rounded-full p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <Button type="button" onClick={saveCategory} disabled={catSaving || catSelected.size === 0} className="w-full bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40">
                  {catSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري الاستيراد...</> : `استيراد ${catSelected.size} منتج إلى السوق`}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
