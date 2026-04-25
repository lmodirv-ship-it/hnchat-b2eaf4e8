import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Image as ImageIcon, Film, BookOpen, Radio, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTab?: "post" | "reel" | "story" | "live" | "product";
}

export function UniversalComposer({ open, onOpenChange, defaultTab = "post" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(defaultTab);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [productTitle, setProductTitle] = useState("");
  const [productPrice, setProductPrice] = useState("");

  const reset = () => {
    setContent("");
    setFile(null);
    setProductTitle("");
    setProductPrice("");
  };

  const uploadMedia = async (bucket: string): Promise<string | null> => {
    if (!file || !user) return null;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const submitPost = async (type: "post" | "video" | "short") => {
    if (!user) return;
    if (!content.trim() && !file) {
      toast.error("أضف نصاً أو وسائط");
      return;
    }
    setBusy(true);
    try {
      const url = file ? await uploadMedia("videos") : null;
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim() || null,
        media_urls: url ? [url] : [],
        type,
      });
      if (error) throw error;
      toast.success("تم النشر!");
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? "فشل النشر");
    } finally {
      setBusy(false);
    }
  };

  const submitStory = async () => {
    if (!user || !file) {
      toast.error("اختر صورة أو فيديو");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadMedia("stories");
      if (!url) throw new Error("upload failed");
      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: url,
        caption: content.trim() || null,
      });
      if (error) throw error;
      toast.success("تم نشر القصة!");
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? "فشل");
    } finally {
      setBusy(false);
    }
  };

  const submitProduct = async () => {
    if (!user) return;
    if (!productTitle.trim() || !productPrice) {
      toast.error("أدخل اسماً وسعراً");
      return;
    }
    setBusy(true);
    try {
      const img = file ? await uploadMedia("products") : null;
      const { error } = await supabase.from("products").insert({
        seller_id: user.id,
        title: productTitle,
        price: parseFloat(productPrice),
        description: content.trim() || null,
        images: img ? [img] : [],
      });
      if (error) throw error;
      toast.success("تم إضافة المنتج");
      reset();
      onOpenChange(false);
      navigate({ to: "/marketplace" });
    } catch (e: any) {
      toast.error(e.message ?? "فشل");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>إنشاء جديد</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="post"><ImageIcon className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="reel"><Film className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="story"><BookOpen className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="live"><Radio className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="product"><ShoppingBag className="h-4 w-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="post" className="space-y-3 pt-4">
            <Textarea
              placeholder="ماذا يدور في ذهنك؟"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Button onClick={() => submitPost("post")} disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "نشر"}
            </Button>
          </TabsContent>

          <TabsContent value="reel" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">فيديو قصير عمودي (Reel)</p>
            <Input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Textarea placeholder="وصف..." value={content} onChange={(e) => setContent(e.target.value)} rows={2} />
            <Button onClick={() => submitPost("short")} disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "نشر Reel"}
            </Button>
          </TabsContent>

          <TabsContent value="story" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">قصة تختفي بعد 24 ساعة</p>
            <Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Input placeholder="تعليق (اختياري)" value={content} onChange={(e) => setContent(e.target.value)} />
            <Button onClick={submitStory} disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "نشر القصة"}
            </Button>
          </TabsContent>

          <TabsContent value="live" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">ابدأ بثاً مباشراً مع متابعيك</p>
            <Button onClick={() => { onOpenChange(false); navigate({ to: "/live" }); }} className="w-full bg-pink-500 hover:bg-pink-600">
              <Radio className="h-4 w-4 mr-2" />
              الذهاب إلى البث المباشر
            </Button>
          </TabsContent>

          <TabsContent value="product" className="space-y-3 pt-4">
            <Input placeholder="اسم المنتج" value={productTitle} onChange={(e) => setProductTitle(e.target.value)} />
            <Input type="number" step="0.01" placeholder="السعر" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
            <Textarea placeholder="الوصف" value={content} onChange={(e) => setContent(e.target.value)} rows={2} />
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Button onClick={submitProduct} disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "أضف للمتجر"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
