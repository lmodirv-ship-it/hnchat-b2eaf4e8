import { useState, useCallback, useRef } from "react";
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
  Bold, Italic, Heading1, Heading2, Heading3, Link as LinkIcon,
  Quote, Code, List, ListOrdered, Smile, Eye, EyeOff,
} from "lucide-react";

const PUBLISHING_RULES = [
  "المحتوى أصلي وغير منسوخ",
  "لا يحتوي على سبام أو محتوى غير قانوني",
  "العنوان واضح ومعبّر",
  "الصورة الرئيسية مطلوبة",
  "المحتوى مفيد ومنسّق بشكل جيد",
];

type Props = { article?: Article };

export function ArticleEditor({ article }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const saveArticle = useSaveArticle();
  const contentRef = useRef<HTMLTextAreaElement>(null);

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
  const [showPreview, setShowPreview] = useState(false);

  const generateSlug = useCallback((t: string) => {
    return t.toLowerCase().replace(/[^\w\s\u0600-\u06FF-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 80);
  }, []);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!article?.id) setSlug(generateSlug(v));
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

  const insertFormat = (before: string, after: string = "") => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); }
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
        title, slug,
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

  const confirmPublish = () => { setShowRules(false); doSave("published"); };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Simple markdown-like rendering for preview
  const renderPreview = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-ice-card/20 text-cyan-glow text-sm font-mono">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-cyan-glow/40 pl-4 italic text-muted-foreground/70 my-3">$1</blockquote>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-cyan-glow underline" target="_blank">$1</a>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 rounded-2xl border border-ice-border/15 bg-ice-card/5 backdrop-blur-xl">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-glow" />
            {article?.id ? "تعديل المقال" : "إنشاء مقال جديد"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {wordCount} كلمة • {readingTime} دقيقة قراءة
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="border-ice-border/20">
            {showPreview ? <EyeOff className="h-4 w-4 ml-1" /> : <Eye className="h-4 w-4 ml-1" />}
            {showPreview ? "إخفاء المعاينة" : "معاينة"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={saveArticle.isPending}>
            <Save className="h-4 w-4 ml-1" /> حفظ كمسودة
          </Button>
          <Button size="sm" onClick={() => handleSave("published")} disabled={saveArticle.isPending}
            className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
            <Send className="h-4 w-4 ml-1" /> نشر المقال
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Content */}
        <div className="space-y-5">
          {/* Title */}
          <div className="p-5 rounded-2xl border border-ice-border/15 bg-ice-card/5">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="عنوان المقال الرئيسي..."
              className="bg-transparent border-0 text-2xl font-bold h-auto py-2 px-0 placeholder:text-muted-foreground/30 focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground/40">
              <span>https://hn-chat.com/blog/</span>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr"
                className="bg-ice-card/10 border-ice-border/20 h-7 text-xs w-48" />
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-2xl border border-ice-border/15 bg-ice-card/5 overflow-hidden">
            {featuredImage ? (
              <div className="relative h-56">
                <img src={featuredImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <label className="cursor-pointer px-3 py-1.5 text-xs rounded-lg bg-background/80 backdrop-blur border border-ice-border/30 hover:bg-ice-card/30 transition font-medium">
                    <ImageIcon className="h-3 w-3 inline ml-1" /> تغيير
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button onClick={() => setFeaturedImage("")} className="px-3 py-1.5 text-xs rounded-lg bg-destructive/80 text-white font-medium">حذف</button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center h-48 hover:bg-ice-card/10 transition">
                <Upload className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <span className="text-sm text-muted-foreground/50 font-medium">{uploading ? "جاري الرفع..." : "رفع الصورة الرئيسية"}</span>
                <span className="text-xs text-muted-foreground/30 mt-1">يُنصح بحجم 1200×630 بكسل</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 flex-wrap p-3 rounded-xl border border-ice-border/15 bg-ice-card/5">
            {[
              { icon: Heading1, action: () => insertFormat("# ", "\n"), tip: "H1" },
              { icon: Heading2, action: () => insertFormat("## ", "\n"), tip: "H2" },
              { icon: Heading3, action: () => insertFormat("### ", "\n"), tip: "H3" },
              { icon: Bold, action: () => insertFormat("**", "**"), tip: "Bold" },
              { icon: Italic, action: () => insertFormat("*", "*"), tip: "Italic" },
              { icon: LinkIcon, action: () => insertFormat("[", "](https://)"), tip: "Link" },
              { icon: Quote, action: () => insertFormat("> "), tip: "Quote" },
              { icon: Code, action: () => insertFormat("`", "`"), tip: "Code" },
              { icon: List, action: () => insertFormat("- "), tip: "List" },
              { icon: ListOrdered, action: () => insertFormat("1. "), tip: "Ordered" },
              { icon: ImageIcon, action: () => insertFormat("![alt](", ")"), tip: "Image" },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} title={btn.tip}
                className="p-2 rounded-lg hover:bg-ice-card/20 text-muted-foreground hover:text-cyan-glow transition">
                <btn.icon className="h-4 w-4" />
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground/40">Markdown مدعوم</span>
          </div>

          {/* Content Editor / Preview */}
          {showPreview ? (
            <div className="p-6 rounded-2xl border border-ice-border/15 bg-ice-card/5 min-h-[400px]">
              <div className="prose prose-invert prose-cyan max-w-none text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderPreview(content) }} />
            </div>
          ) : (
            <Textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب محتوى المقال هنا... (يدعم Markdown)"
              className="bg-ice-card/5 border-ice-border/15 min-h-[400px] font-mono text-sm rounded-2xl p-5 leading-relaxed"
            />
          )}

          {/* Video URL */}
          <div className="p-4 rounded-2xl border border-ice-border/15 bg-ice-card/5">
            <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5" /> فيديو (اختياري)
            </label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="رابط YouTube أو MP4..." dir="ltr"
              className="bg-ice-card/10 border-ice-border/20" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Meta */}
          <div className="rounded-2xl border border-ice-border/15 bg-ice-card/5 p-4 space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">إعدادات المقال</h3>

            <div>
              <label className="text-[11px] text-muted-foreground/60 mb-1 block">التصنيف</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-ice-card/10 border-ice-border/20 h-9"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_ar ?? c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground/60 mb-1 block">اللغة</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-ice-card/10 border-ice-border/20 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground/60 mb-1 block">حالة النشر</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-ice-card/10 border-ice-border/20 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="published">منشور</SelectItem>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Short Description */}
          <div className="rounded-2xl border border-ice-border/15 bg-ice-card/5 p-4">
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">وصف قصير</label>
            <Textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
              placeholder="وصف مختصر للمقال..." className="bg-ice-card/10 border-ice-border/20 min-h-[80px] text-sm" maxLength={160} />
            <p className="text-[10px] text-muted-foreground/40 text-left mt-1">{shortDesc.length}/160</p>
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-ice-border/15 bg-ice-card/5 p-4">
            <label className="text-xs font-semibold text-muted-foreground mb-2 block flex items-center gap-1"><Tag className="h-3 w-3" /> الوسوم</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30">
                  {tag}
                  <button onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="أضف وسم..." className="bg-ice-card/10 border-ice-border/20 text-xs h-8" />
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-2xl border border-ice-border/15 bg-ice-card/5 p-4 space-y-3">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><SearchIcon className="h-3 w-3" /> SEO</label>
            <div>
              <label className="text-[10px] text-muted-foreground/60 block mb-0.5">عنوان SEO</label>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="عنوان SEO..." className="bg-ice-card/10 border-ice-border/20 text-xs h-8" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground/60 block mb-0.5">وصف SEO</label>
              <Textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)}
                placeholder="وصف SEO..." className="bg-ice-card/10 border-ice-border/20 text-xs min-h-[60px]" maxLength={160} />
              <p className="text-[10px] text-muted-foreground/40 text-left mt-0.5">{seoDesc.length}/160</p>
            </div>

            {/* SEO Preview */}
            <div className="p-3 rounded-xl bg-ice-card/10 border border-ice-border/10">
              <p className="text-[10px] text-muted-foreground/40 mb-1">معاينة محركات البحث</p>
              <p className="text-sm text-blue-400 font-medium truncate">{seoTitle || title || "عنوان المقال"}</p>
              <p className="text-[10px] text-green-400/70 truncate">hn-chat.com/blog/{slug || "..."}</p>
              <p className="text-[11px] text-muted-foreground/50 line-clamp-2 mt-0.5">{seoDesc || shortDesc || "وصف المقال..."}</p>
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
