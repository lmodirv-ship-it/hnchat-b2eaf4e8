import { useState, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useSaveArticle, useCategories, uploadBlogImage, type Article } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Image as ImageIcon, Video, X, Save, Send, ArrowRight,
  Upload, FileText, Tag, Globe, Search as SearchIcon,
} from "lucide-react";

const PUBLISHING_RULES = [
  "المحتوى أصلي وغير منسوخ",
  "لا يحتوي على سبام أو محتوى غير قانوني",
  "العنوان واضح ومعبّر",
  "الصورة الرئيسية مطلوبة",
  "المحتوى مفيد ومنسّق بشكل جيد",
];

type Props = {
  article?: Article;
};

export function ArticleEditor({ article }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const saveArticle = useSaveArticle();

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [categoryId, setCategoryId] = useState(article?.category_id ?? "");
  const [language, setLanguage] = useState(article?.language ?? "ar");
  const [featuredImage, setFeaturedImage] = useState(article?.featured_image ?? "");
  const [videoUrl, setVideoUrl] = useState(article?.video_url ?? "");
  const [shortDesc, setShortDesc] = useState(article?.short_description ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [seoTitle, setSeoTitle] = useState(article?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(article?.seo_description ?? "");
  const [status, setStatus] = useState(article?.status ?? "draft");
  const [uploading, setUploading] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const generateSlug = useCallback((t: string) => {
    return t
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 80);
  }, []);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!article?.id) {
      setSlug(generateSlug(v));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadBlogImage(file, user.id);
      setFeaturedImage(url);
      toast.success("تم رفع الصورة");
    } catch (err: any) {
      toast.error(err.message ?? "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = async (publishStatus: string) => {
    if (!title.trim()) return toast.error("العنوان مطلوب");
    if (!slug.trim()) return toast.error("الرابط مطلوب");

    if (publishStatus === "published") {
      if (!featuredImage) return toast.error("الصورة الرئيسية مطلوبة للنشر");
      if (!content?.trim()) return toast.error("المحتوى مطلوب للنشر");
      setShowRules(true);
      setStatus(publishStatus);
      return;
    }

    await doSave(publishStatus);
  };

  const doSave = async (publishStatus: string) => {
    try {
      await saveArticle.mutateAsync({
        ...(article?.id ? { id: article.id } : {}),
        title,
        slug,
        category_id: categoryId || null,
        language,
        featured_image: featuredImage || null,
        video_url: videoUrl || null,
        short_description: shortDesc || null,
        content: content || null,
        tags,
        seo_title: seoTitle || null,
        seo_description: seoDesc || null,
        status: publishStatus,
      });
      toast.success(publishStatus === "published" ? "تم نشر المقال ✅" : "تم الحفظ كمسودة");
      navigate({ to: "/blog-dashboard" as any });
    } catch (err: any) {
      toast.error(err.message ?? "حدث خطأ");
    }
  };

  const confirmPublish = () => {
    setShowRules(false);
    doSave("published");
  };

  return (
    <div className="max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-glow" />
            {article?.id ? "تعديل المقال" : "إنشاء مقال جديد"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">المدونة &gt; {article?.id ? "تعديل" : "إنشاء مقال جديد"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={saveArticle.isPending}>
            <Save className="h-4 w-4 ml-1" /> حفظ كمسودة
          </Button>
          <Button size="sm" onClick={() => handleSave("published")} disabled={saveArticle.isPending}
            className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
            <Send className="h-4 w-4 ml-1" /> نشر المقال
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-5">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">العنوان</label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="عنوان المقال..." className="bg-ice-card/10 border-ice-border/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">الرابط (Slug)</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="article-slug" dir="ltr" className="bg-ice-card/10 border-ice-border/20" />
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">https://hn-chat.com/blog/{slug}</p>
            </div>
          </div>

          {/* Category, Language, Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">التصنيف</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-ice-card/10 border-ice-border/20"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name_ar ?? c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">اللغة</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-ice-card/10 border-ice-border/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">حالة النشر</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-ice-card/10 border-ice-border/20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">الصورة الرئيسية</label>
            {featuredImage ? (
              <div className="relative rounded-xl overflow-hidden border border-ice-border/20 h-48">
                <img src={featuredImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 flex gap-2">
                  <label className="cursor-pointer px-3 py-1 text-xs rounded-lg bg-background/80 backdrop-blur border border-ice-border/30 hover:bg-ice-card/30 transition">
                    <ImageIcon className="h-3 w-3 inline ml-1" /> تغيير الصورة
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button onClick={() => setFeaturedImage("")} className="px-3 py-1 text-xs rounded-lg bg-destructive/80 text-white">
                    حذف
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-ice-border/30 bg-ice-card/5 hover:bg-ice-card/10 transition">
                <Upload className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <span className="text-sm text-muted-foreground/60">{uploading ? "جاري الرفع..." : "اسحب وأفلت الصورة هنا أو انقر للرفع"}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          {/* Video URL */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">فيديو (اختياري)</label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="رابط فيديو YouTube أو MP4..." dir="ltr" className="bg-ice-card/10 border-ice-border/20" />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">المحتوى</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب محتوى المقال هنا... (يدعم Markdown)"
              className="bg-ice-card/10 border-ice-border/20 min-h-[300px] font-mono text-sm"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Short Description */}
          <div className="rounded-xl border border-ice-border/20 bg-ice-card/5 p-4">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">وصف قصير</label>
            <Textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="وصف مختصر للمقال..." className="bg-ice-card/10 border-ice-border/20 min-h-[80px] text-sm" maxLength={160} />
            <p className="text-[10px] text-muted-foreground/40 text-left mt-1">{shortDesc.length}/160</p>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-ice-border/20 bg-ice-card/5 p-4">
            <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-1"><Tag className="h-3 w-3" /> الوسوم (اختياري)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30">
                  {tag}
                  <button onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="أضف وسم ثم اضغط Enter" className="bg-ice-card/10 border-ice-border/20 text-xs h-8" />
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-ice-border/20 bg-ice-card/5 p-4 space-y-3">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><SearchIcon className="h-3 w-3" /> SEO</label>
            <div>
              <label className="text-[10px] text-muted-foreground/60 block mb-0.5">العنوان (اختياري)</label>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="عنوان SEO..." className="bg-ice-card/10 border-ice-border/20 text-xs h-8" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground/60 block mb-0.5">الوصف (اختياري)</label>
              <Textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="وصف SEO..." className="bg-ice-card/10 border-ice-border/20 text-xs min-h-[60px]" maxLength={160} />
              <p className="text-[10px] text-muted-foreground/40 text-left mt-0.5">{seoDesc.length}/160</p>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowRules(false)}>
          <div className="bg-background border border-ice-border/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-diamond" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">قواعد النشر</h3>
            <p className="text-sm text-muted-foreground mb-4">قبل النشر، تأكد من:</p>
            <ul className="space-y-2 mb-6">
              {PUBLISHING_RULES.map((rule, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="h-5 w-5 rounded-full bg-cyan-glow/20 text-cyan-glow flex items-center justify-center text-[10px]">✓</span>
                  {rule}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowRules(false)} className="flex-1">إلغاء</Button>
              <Button onClick={confirmPublish} className="flex-1 bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
                <Send className="h-4 w-4 ml-1" /> تأكيد النشر
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
