import { useEffect, useRef, useState, type FormEvent } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "إلكترونيات",
  "أزياء",
  "منزل",
  "رياضة",
  "كتب",
  "ألعاب",
  "صحة وجمال",
  "أخرى",
];

export function NewProductDialog({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("1");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []).slice(0, 5);
    setFiles(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  }

  function reset() {
    setTitle("");
    setDescription("");
    setPrice("");
    setCurrency("USD");
    setCategory("");
    setStock("1");
    setFiles([]);
    setPreviews([]);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user || submitting) return;
    const priceNum = parseFloat(price);
    if (!title.trim() || !priceNum || priceNum <= 0) {
      toast.error("يرجى ملء العنوان والسعر");
      return;
    }
    setSubmitting(true);
    try {
      // Upload images
      const urls: string[] = [];
      for (const f of files) {
        const ext = f.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("products")
          .upload(path, f);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
        urls.push(pub.publicUrl);
      }

      const { error: insErr } = await supabase.from("products").insert({
        seller_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        price: priceNum,
        currency,
        category: category || null,
        stock: parseInt(stock) || 0,
        images: urls,
        is_active: true,
      });
      if (insErr) throw insErr;
      toast.success("تم نشر المنتج 🎉");
      reset();
      setOpen(false);
      onCreated?.();
    } catch (err: any) {
      toast.error(err?.message || "فشل النشر");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40">
          <Plus className="h-4 w-4 mr-1" /> منتج جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-ice-card border-ice-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>أضف منتجاً جديداً</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input
            placeholder="اسم المنتج *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="bg-ice-bg border-ice-border"
          />
          <Textarea
            placeholder="وصف المنتج"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
            className="bg-ice-bg border-ice-border resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="السعر *"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-ice-bg border-ice-border"
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="bg-ice-bg border-ice-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-ice-card border-ice-border">
                <SelectItem value="USD">USD $</SelectItem>
                <SelectItem value="EUR">EUR €</SelectItem>
                <SelectItem value="SAR">SAR ﷼</SelectItem>
                <SelectItem value="AED">AED د.إ</SelectItem>
                <SelectItem value="EGP">EGP £</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-ice-bg border-ice-border">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent className="bg-ice-card border-ice-border">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="0"
              placeholder="الكمية"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="bg-ice-bg border-ice-border"
            />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onPick}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="w-full bg-ice-bg border-ice-border"
          >
            <Upload className="h-4 w-4 mr-2" />
            {files.length ? `${files.length} صورة` : "أضف صوراً (حتى 5)"}
          </Button>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative aspect-square rounded overflow-hidden border border-ice-border">
                  <img src={p} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setFiles(files.filter((_, j) => j !== i));
                      setPreviews(previews.filter((_, j) => j !== i));
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري النشر...
              </>
            ) : (
              "نشر المنتج"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
