import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useSaveArticle, useCategories, uploadBlogImage, type Article } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Image as ImageIcon, Video, X, Save, Send,
  Upload, FileText, Tag, Search as SearchIcon,
  Bold, Italic, Heading1, Heading2, Heading3, Link as LinkIcon,
  Quote, Code, List, ListOrdered, Eye, EyeOff, ArrowLeft,
  ChevronDown, ChevronUp, Settings2, Palette,
} from "lucide-react";
import { PublishSuccessDialog } from "@/components/blog/PublishSuccessDialog";

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
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [showSettings, setShowSettings] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [publishedDialog, setPublishedDialog] = useState<{ url: string; title: string } | null>(null);

  const generateSlug = useCallback((t: string) => {
    return t.toLowerCase().replace(/[^\w\s\u0600-\u06FF-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 80);
  }, []);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    setIsDirty(true);
    if (!article?.id) setSlug(generateSlug(v));
  };

  const handleContentChange = (v: string) => {
    setContent(v);
    setIsDirty(true);
  };

  // Auto-save disabled — user saves manually via buttons

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadBlogImage(file, user.id);
      setFeaturedImage(url);
      setIsDirty(true);
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
    setIsDirty(true);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); setIsDirty(true); }
  };
  const removeTag = (tag: string) => { setTags(tags.filter((t) => t !== tag)); setIsDirty(true); };

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
      const saved: any = await saveArticle.mutateAsync({
        ...(article?.id ? { id: article.id } : {}),
        title, slug, category_id: categoryId || null, language,
        featured_image: featuredImage || null, video_url: videoUrl || null,
        short_description: shortDesc || null, content: content || null,
        tags, seo_title: seoTitle || null, seo_description: seoDesc || null,
        status: publishStatus,
      });
      setLastSaved(new Date());
      setIsDirty(false);

      if (publishStatus === "published") {
        const articleKey = saved?.short_id ?? saved?.id ?? slug;
        setPublishedDialog({
          url: `https://www.hn-chat.com/blog/${articleKey}`,
          title: saved?.title ?? title,
        });
        toast.success("تم نشر المقال ✅");
      } else {
        toast.success("تم الحفظ كمسودة");
        navigate({ to: "/blog-dashboard" as any });
      }
    } catch (err: any) {
      toast.error(err.message ?? "حدث خطأ");
    }
  };

  const confirmPublish = () => { setShowRules(false); doSave("published"); };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const renderPreview = (text: string) => {
    const raw = text
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-foreground">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-5 text-foreground">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-2 py-1 rounded-lg bg-[oklch(0.2_0.02_250)] text-cyan-glow text-sm font-mono border border-ice-border/10">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-cyan-glow/30 pl-5 italic text-muted-foreground/70 my-5 text-lg">$1</blockquote>')
      .replace(/\[(.+?)\]\((.+?)\)/g, (_, label, url) => {
        if (/^https?:\/\//i.test(url)) {
          return `<a href="${url}" class="text-cyan-glow underline underline-offset-4 hover:text-cyan-glow/80 transition" target="_blank" rel="noopener">${label}</a>`;
        }
        return label;
      })
      .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc mb-1">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-5 leading-relaxed">')
      .replace(/\n/g, '<br/>');
    return raw;
  };

  const sanitizeHtml = async (html: string) => {
    const DOMPurify = (await import('dompurify')).default;
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'a', 'code', 'pre', 'blockquote', 'li', 'ul', 'ol', 'span'],
      ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^https?:\/\//i,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 min-h-screen bg-gradient-to-b from-[oklch(0.14_0.03_250)] via-[oklch(0.12_0.025_245)] to-[oklch(0.13_0.028_255)]" dir="rtl">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 sticky top-0 z-30 py-3 -mx-4 px-4 bg-[oklch(0.14_0.03_250)]/90 backdrop-blur-xl border-b border-ice-border/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate({ to: "/blog-dashboard" as any })}
            className="p-2 rounded-xl hover:bg-ice-card/10 text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{article?.id ? "تعديل المقال" : "مقال جديد"}</h1>
            <p className="text-[11px] text-muted-foreground/50">
              {wordCount} كلمة • {readingTime} د قراءة
              {lastSaved && <span className="mr-2">• حُفظ {lastSaved.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}</span>}
              {isDirty && <span className="mr-2 text-amber-400">• تغييرات غير محفوظة</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}
            className={`text-xs ${showPreview ? "text-cyan-glow" : "text-muted-foreground"}`}>
            {showPreview ? <EyeOff className="h-4 w-4 ml-1" /> : <Eye className="h-4 w-4 ml-1" />}
            {showPreview ? "تحرير" : "معاينة"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={saveArticle.isPending}
            className="border-ice-border/20 text-xs">
            <Save className="h-3.5 w-3.5 ml-1" /> مسودة
          </Button>
          <Button size="sm" onClick={() => handleSave("published")} disabled={saveArticle.isPending}
            className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground text-xs px-5">
            <Send className="h-3.5 w-3.5 ml-1" /> نشر
          </Button>
        </div>
      </div>

      {/* Title - Large & Clean */}
      <div className="mb-8 p-6 sm:p-8 rounded-2xl border border-ice-border/10 bg-gradient-to-br from-[oklch(0.16_0.025_250)] to-[oklch(0.14_0.02_250)] backdrop-blur-xl shadow-[0_4px_30px_oklch(0_0_0/0.2)]">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="عنوان المقال..."
          className="w-full bg-transparent text-3xl sm:text-4xl font-bold border-0 outline-none placeholder:text-muted-foreground/20 leading-tight"
        />
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-ice-border/8 text-xs text-muted-foreground/40">
          <span>hn-chat.com/blog/</span>
          <input value={slug} onChange={(e) => { setSlug(e.target.value); setIsDirty(true); }} dir="ltr"
            className="bg-ice-card/10 border border-ice-border/15 rounded-lg px-3 py-1.5 text-xs w-52 outline-none focus:border-cyan-glow/30 transition" />
        </div>
      </div>

      {/* Featured Image */}
      <div className="mb-8 rounded-2xl overflow-hidden border border-ice-border/10 bg-gradient-to-br from-[oklch(0.16_0.025_250)] to-[oklch(0.14_0.02_250)] backdrop-blur-xl shadow-[0_4px_30px_oklch(0_0_0/0.2)]">
        {featuredImage ? (
          <div className="relative h-72 sm:h-96 group bg-[oklch(0.12_0.02_250)]">
            <img src={featuredImage} alt="" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="cursor-pointer px-4 py-2 text-xs font-medium rounded-xl bg-background/90 backdrop-blur border border-ice-border/20 hover:bg-ice-card/30 transition">
                <ImageIcon className="h-3.5 w-3.5 inline ml-1.5" /> تغيير
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <button onClick={() => { setFeaturedImage(""); setIsDirty(true); }}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-destructive/80 text-white">حذف</button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center h-52 hover:bg-[oklch(0.18_0.02_250)] transition-colors">
            <div className="p-4 rounded-2xl bg-ice-card/10 mb-3">
              <Upload className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <span className="text-sm text-muted-foreground/50 font-medium">{uploading ? "جاري الرفع..." : "رفع الصورة الرئيسية"}</span>
            <span className="text-[11px] text-muted-foreground/30 mt-1">يُنصح بحجم 1200×630 بكسل • PNG أو JPG</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
          </label>
        )}
      </div>

      {/* Formatting Toolbar */}
      <div className="sticky top-[72px] z-20 flex items-center gap-0.5 flex-wrap p-2.5 mb-4 rounded-2xl border border-ice-border/10 bg-gradient-to-r from-[oklch(0.16_0.025_250)] to-[oklch(0.15_0.02_250)] backdrop-blur-xl shadow-[0_4px_20px_oklch(0_0_0/0.15)]">
        {[
          { icon: Heading1, action: () => insertFormat("# ", "\n"), tip: "عنوان رئيسي" },
          { icon: Heading2, action: () => insertFormat("## ", "\n"), tip: "عنوان فرعي" },
          { icon: Heading3, action: () => insertFormat("### ", "\n"), tip: "عنوان ثالث" },
          null,
          { icon: Bold, action: () => insertFormat("**", "**"), tip: "عريض" },
          { icon: Italic, action: () => insertFormat("*", "*"), tip: "مائل" },
          { icon: LinkIcon, action: () => insertFormat("[", "](https://)"), tip: "رابط" },
          null,
          { icon: Quote, action: () => insertFormat("> "), tip: "اقتباس" },
          { icon: Code, action: () => insertFormat("`", "`"), tip: "كود" },
          { icon: List, action: () => insertFormat("- "), tip: "قائمة" },
          { icon: ListOrdered, action: () => insertFormat("1. "), tip: "قائمة مرقمة" },
          null,
          { icon: ImageIcon, action: () => insertFormat("![وصف](", ")"), tip: "صورة" },
          { icon: Video, action: () => insertFormat("[فيديو](", ")"), tip: "فيديو" },
        ].map((btn, i) => btn === null ? (
          <div key={`sep-${i}`} className="w-px h-5 bg-ice-border/15 mx-1" />
        ) : (
          <button key={i} onClick={btn.action} title={btn.tip}
            className="p-2.5 rounded-lg hover:bg-ice-card/20 text-muted-foreground/60 hover:text-cyan-glow transition">
            <btn.icon className="h-4 w-4" />
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground/30 px-2">Markdown</span>
      </div>

      {/* Content Editor / Preview */}
      {showPreview ? (
        <SanitizedPreview content={content} renderPreview={renderPreview} sanitizeHtml={sanitizeHtml} />
      ) : (
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="ابدأ الكتابة هنا..."
          className="w-full bg-gradient-to-br from-[oklch(0.16_0.025_250)] to-[oklch(0.14_0.02_250)] border border-ice-border/10 min-h-[500px] rounded-2xl p-8 sm:p-12 text-lg leading-[2] font-normal text-foreground/90 placeholder:text-muted-foreground/20 outline-none focus:border-cyan-glow/20 transition resize-none mb-8 shadow-[0_4px_30px_oklch(0_0_0/0.2)]"
        />
      )}

      {/* Video URL */}
      <div className="p-5 rounded-2xl border border-ice-border/10 bg-gradient-to-br from-[oklch(0.16_0.025_250)] to-[oklch(0.14_0.02_250)] backdrop-blur-xl shadow-[0_4px_30px_oklch(0_0_0/0.2)] mb-6">
        <label className="text-sm font-semibold text-muted-foreground/70 mb-3 block flex items-center gap-2">
          <Video className="h-4 w-4" /> فيديو (اختياري)
        </label>
        <Input value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value); setIsDirty(true); }}
          placeholder="رابط YouTube أو ملف MP4..." dir="ltr"
          className="bg-ice-card/5 border-ice-border/15 h-11 text-sm" />
      </div>

      {/* Collapsible: Article Settings */}
      <div className="rounded-2xl border border-ice-border/10 bg-gradient-to-br from-[oklch(0.16_0.025_250)] to-[oklch(0.14_0.02_250)] backdrop-blur-xl shadow-[0_4px_30px_oklch(0_0_0/0.2)] mb-6 overflow-hidden">
        <button onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between p-5 text-sm font-semibold text-muted-foreground/70 hover:text-foreground transition">
          <span className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> إعدادات المقال</span>
          {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showSettings && (
          <div className="p-5 pt-0 space-y-5 border-t border-ice-border/10">
            {/* Short Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground/60 mb-2 block">وصف قصير</label>
              <Textarea value={shortDesc} onChange={(e) => { setShortDesc(e.target.value); setIsDirty(true); }}
                placeholder="وصف مختصر يظهر في بطاقة المقال..."
                className="bg-ice-card/5 border-ice-border/15 min-h-[80px] text-sm" maxLength={160} />
              <p className="text-[10px] text-muted-foreground/30 text-left mt-1">{shortDesc.length}/160</p>
            </div>

            {/* Category, Language, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground/60 mb-2 block">التصنيف</label>
                <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setIsDirty(true); }}>
                  <SelectTrigger className="bg-ice-card/5 border-ice-border/15 h-10"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name_ar ?? c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground/60 mb-2 block">اللغة</label>
                <Select value={language} onValueChange={(v) => { setLanguage(v); setIsDirty(true); }}>
                  <SelectTrigger className="bg-ice-card/5 border-ice-border/15 h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground/60 mb-2 block">الحالة</label>
                <Select value={status} onValueChange={(v) => { setStatus(v); setIsDirty(true); }}>
                  <SelectTrigger className="bg-ice-card/5 border-ice-border/15 h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="scheduled">مجدول</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-muted-foreground/60 mb-2 block flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> الوسوم</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/20">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-white transition"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="أضف وسم ثم Enter..."
                className="bg-ice-card/5 border-ice-border/15 text-sm h-10" />
            </div>
          </div>
        )}
      </div>

      {/* Collapsible: SEO */}
      <div className="rounded-2xl border border-ice-border/10 bg-gradient-to-br from-[oklch(0.16_0.025_250)] to-[oklch(0.14_0.02_250)] backdrop-blur-xl shadow-[0_4px_30px_oklch(0_0_0/0.2)] mb-8 overflow-hidden">
        <button onClick={() => setShowSeo(!showSeo)}
          className="w-full flex items-center justify-between p-5 text-sm font-semibold text-muted-foreground/70 hover:text-foreground transition">
          <span className="flex items-center gap-2"><SearchIcon className="h-4 w-4" /> تحسين محركات البحث (SEO)</span>
          {showSeo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showSeo && (
          <div className="p-5 pt-0 space-y-4 border-t border-ice-border/10">
            <div>
              <label className="text-xs font-medium text-muted-foreground/60 mb-2 block">عنوان SEO</label>
              <Input value={seoTitle} onChange={(e) => { setSeoTitle(e.target.value); setIsDirty(true); }}
                placeholder="عنوان يظهر في محركات البحث..."
                className="bg-ice-card/5 border-ice-border/15 text-sm h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground/60 mb-2 block">وصف SEO</label>
              <Textarea value={seoDesc} onChange={(e) => { setSeoDesc(e.target.value); setIsDirty(true); }}
                placeholder="وصف مختصر لمحركات البحث..."
                className="bg-ice-card/5 border-ice-border/15 text-sm min-h-[70px]" maxLength={160} />
              <p className="text-[10px] text-muted-foreground/30 text-left mt-1">{seoDesc.length}/160</p>
            </div>
            {/* Preview Card */}
            <div className="p-4 rounded-xl bg-[oklch(0.12_0.02_250)] border border-ice-border/10">
              <p className="text-[10px] text-muted-foreground/30 mb-1.5 font-medium uppercase tracking-wider">معاينة Google</p>
              <p className="text-blue-400 font-medium text-sm truncate">{seoTitle || title || "عنوان المقال"}</p>
              <p className="text-[11px] text-green-400/60 truncate mt-0.5">hn-chat.com/blog/{slug || "..."}</p>
              <p className="text-xs text-muted-foreground/40 line-clamp-2 mt-1">{seoDesc || shortDesc || "وصف المقال سيظهر هنا..."}</p>
            </div>
          </div>
        )}
      </div>

      {/* Publishing Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowRules(false)}>
          <div className="bg-[oklch(0.16_0.02_250)] border border-ice-border/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">قواعد النشر</h3>
            <p className="text-sm text-muted-foreground/60 mb-5">تأكد من التزامك بهذه القواعد:</p>
            <ul className="space-y-3 mb-7">
              {PUBLISHING_RULES.map((rule, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="h-6 w-6 rounded-full bg-cyan-glow/15 text-cyan-glow flex items-center justify-center text-xs shrink-0">✓</span>
                  <span className="text-muted-foreground/80">{rule}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowRules(false)} className="flex-1 border-ice-border/20">إلغاء</Button>
              <Button onClick={confirmPublish} className="flex-1 bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
                <Send className="h-4 w-4 ml-1.5" /> تأكيد النشر
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Success Dialog */}
      <PublishSuccessDialog
        open={!!publishedDialog}
        articleUrl={publishedDialog?.url ?? ""}
        articleTitle={publishedDialog?.title ?? ""}
        onClose={() => {
          setPublishedDialog(null);
          navigate({ to: "/blog-dashboard" as any });
        }}
      />
    </div>
  );
}

function SanitizedPreview({ content, renderPreview, sanitizeHtml }: { content: string; renderPreview: (t: string) => string; sanitizeHtml: (h: string) => Promise<string> }) {
  const [safe, setSafe] = useState('');
  useEffect(() => {
    sanitizeHtml(`<p class="mb-5 leading-relaxed">${renderPreview(content)}</p>`).then(setSafe);
  }, [content, renderPreview, sanitizeHtml]);
  return (
    <div className="p-8 sm:p-12 rounded-2xl border border-ice-border/10 bg-gradient-to-br from-[oklch(0.16_0.025_250)] to-[oklch(0.13_0.02_250)] min-h-[500px] mb-8 shadow-[0_4px_30px_oklch(0_0_0/0.2)]">
      <div className="max-w-3xl mx-auto prose prose-invert prose-lg"
        style={{ fontSize: '1.125rem', lineHeight: '2' }}
        dangerouslySetInnerHTML={{ __html: safe }} />
    </div>
  );
}
