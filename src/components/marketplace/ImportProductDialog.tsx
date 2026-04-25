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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Globe, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { scrapeProductUrl, type ScrapedProduct } from "@/utils/scrape-product.functions";

export function ImportProductDialog({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ScrapedProduct | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  function reset() {
    setUrl("");
    setData(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setCurrency("USD");
    setSelectedImages([]);
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

  async function save() {
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
            استيراد منتج من موقع إلكتروني
          </DialogTitle>
        </DialogHeader>

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
          نقرأ بيانات المنتج (العنوان، الصور، السعر) من بيانات الصفحة (Open Graph / JSON-LD).
        </p>

        {data && (
          <div className="space-y-3 pt-2 border-t border-ice-border">
            <Input
              placeholder="اسم المنتج"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-ice-bg border-ice-border"
            />
            <Textarea
              placeholder="الوصف"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-ice-bg border-ice-border resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="السعر"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-ice-bg border-ice-border"
              />
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                maxLength={4}
                className="bg-ice-bg border-ice-border"
              />
            </div>

            {data.images.length > 0 && (
              <div>
                <p className="text-xs mb-1 text-muted-foreground">
                  اختر الصور ({selectedImages.length}/{data.images.length})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {data.images.map((src) => {
                    const active = selectedImages.includes(src);
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => toggleImage(src)}
                        className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                          active ? "border-violet-glow" : "border-ice-border opacity-60"
                        }`}
                      >
                        <img src={src} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground truncate" dir="ltr">
              المصدر: {data.siteName}
            </div>

            <Button
              type="button"
              onClick={save}
              disabled={saving}
              className="w-full bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري الإضافة...</> : "إضافة إلى السوق"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
