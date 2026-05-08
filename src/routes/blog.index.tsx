import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, ArrowRight, FileText, User, TrendingUp, Sparkles, Mail, Search, Heart, Globe } from "lucide-react";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { usePublishedArticles, useCategories } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "مدونة hnChat — أحدث أخبار الذكاء الاصطناعي والتقنية" },
      { name: "description", content: "تابع أحدث المقالات عن الذكاء الاصطناعي، الكريبتو، الخصوصية، وتقنيات التطبيقات الشاملة من فريق hnChat." },
      { property: "og:title", content: "مدونة hnChat — أحدث الأخبار" },
      { property: "og:description", content: "مقالات عن الذكاء الاصطناعي والكريبتو والخصوصية وتقنيات التطبيقات الشاملة." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://hn-chat.com/blog" }],
  }),
  component: BlogPage,
});

const LANGUAGES = [
  { code: "all", label: "الكل", flag: "🌍" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLang, setActiveLang] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: articles = [], isLoading } = usePublishedArticles(
    activeLang !== "all" ? { language: activeLang } : undefined
  );
  const { data: categories = [] } = useCategories();

  const filtered = useMemo(() => {
    let list = activeCategory === "all"
      ? articles
      : articles.filter((a) => (a.article_categories as any)?.slug === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || (a.short_description ?? "").toLowerCase().includes(q));
    }
    return list;
  }, [articles, activeCategory, searchQuery]);

  const isRtl = activeLang === "ar" || activeLang === "all";

  const featured = articles[0];
  const trending = articles.slice(0, 4);

  return (
    <PublicPageShell dir={isRtl ? "rtl" : "ltr"} headerActions={
      <Link
        to="/feed"
        hash="articles-section"
        className="px-5 py-2 text-xs font-semibold rounded-full text-white transition-all hover:shadow-[0_0_20px_oklch(0.65_0.25_295/0.4)] hover:scale-105"
        style={{ background: "linear-gradient(135deg, oklch(0.65 0.25 295) 0%, oklch(0.55 0.20 270) 50%, oklch(0.78 0.18 220) 100%)" }}
      >
        المقالات
      </Link>
    }>
      {/* Hero */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.2_0.06_250)] via-transparent to-transparent" />
        <div className="absolute top-16 left-1/4 w-[500px] h-[500px] bg-cyan-glow/4 rounded-full blur-[150px]" />
        <div className="absolute top-8 right-1/3 w-80 h-80 bg-violet-glow/4 rounded-full blur-[120px]" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full border border-cyan-glow/20 text-cyan-glow mb-6 bg-cyan-glow/5">
            مدونة hnChat
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            اكتشف مستقبل{" "}
            <span className="bg-gradient-to-r from-cyan-glow via-[oklch(0.75_0.2_260)] to-violet-glow bg-clip-text text-transparent">الذكاء الاصطناعي والتقنية</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground/60 max-w-2xl mx-auto leading-relaxed mb-8">
            مقالات متخصصة في الذكاء الاصطناعي، العملات الرقمية، الخصوصية، والجيل القادم من التقنية الاجتماعية.
          </p>

          {/* Language Selector */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border flex items-center gap-2 ${
                  activeLang === lang.code
                    ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground border-transparent shadow-[0_0_20px_oklch(0.78_0.18_220/0.15)]"
                    : "border-ice-border/15 bg-[oklch(0.14_0.02_250)] text-muted-foreground hover:text-foreground hover:border-cyan-glow/25"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المقالات..."
              className="w-full h-13 pr-12 pl-5 rounded-2xl bg-[oklch(0.15_0.02_250)] border border-ice-border/15 text-sm placeholder:text-muted-foreground/30 outline-none focus:border-cyan-glow/30 transition"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Article */}
      {featured && !searchQuery && (
        <section className="max-w-7xl mx-auto px-6 mb-14">
          <Link to="/blog/$articleId" params={{ articleId: featured.id }} className="group block">
            <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="relative rounded-3xl overflow-hidden border border-ice-border/10 bg-[oklch(0.14_0.02_250)] hover:border-cyan-glow/20 transition-all duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[380px]">
                <div className="relative h-72 lg:h-auto overflow-hidden">
                  {featured.featured_image ? (
                    <img src={featured.featured_image} alt={featured.title} loading="eager"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[oklch(0.14_0.02_250)] hidden lg:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.02_250)] to-transparent lg:hidden" />
                </div>
                <div className="p-8 lg:p-14 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 text-[10px] font-bold rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow text-white w-fit mb-4 tracking-wider">
                    مميز
                  </span>
                  {(featured.article_categories as any) && (
                    <span className="text-xs text-cyan-glow/80 font-semibold mb-3 tracking-wide uppercase">{(featured.article_categories as any).name}</span>
                  )}
                  <h2 className="text-2xl lg:text-4xl font-bold mb-4 leading-tight group-hover:text-cyan-glow transition-colors duration-500">
                    {featured.title}
                  </h2>
                  {featured.short_description && (
                    <p className="text-muted-foreground/50 mb-6 line-clamp-3 text-base leading-relaxed">{featured.short_description}</p>
                  )}
                  <div className="flex items-center gap-5 text-sm text-muted-foreground/40">
                    <div className="flex items-center gap-2.5">
                      {(featured.profiles as any)?.avatar_url ? (
                        <img src={(featured.profiles as any).avatar_url} alt="" className="h-9 w-9 rounded-full ring-2 ring-cyan-glow/10" />
                      ) : <div className="h-9 w-9 rounded-full bg-ice-card/20 flex items-center justify-center"><User className="h-4 w-4" /></div>}
                      <span className="font-medium text-foreground/60">{(featured.profiles as any)?.full_name ?? (featured.profiles as any)?.username}</span>
                    </div>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{featured.published_at ? new Date(featured.published_at).toLocaleDateString() : ""}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{featured.reading_time} دقائق</span>
                    <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{featured.views_count}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          </Link>
        </section>
      )}

      {/* Trending */}
      {trending.length > 1 && !searchQuery && (
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <div className="flex items-center gap-2.5 mb-7">
            <div className="p-2 rounded-xl bg-cyan-glow/10"><TrendingUp className="h-4 w-4 text-cyan-glow" /></div>
            <h2 className="text-xl font-bold">الأكثر رواجاً</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link to="/blog/$articleId" params={{ articleId: article.id }} className="group block">
                  <article className="rounded-2xl overflow-hidden border border-ice-border/10 bg-[oklch(0.14_0.02_250)] hover:border-cyan-glow/20 hover:shadow-[0_12px_50px_oklch(0.78_0.18_220/0.06)] transition-all duration-700">
                    <div className="relative h-44 overflow-hidden">
                      {article.featured_image ? (
                        <img src={article.featured_image} alt={article.title} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-glow/8 to-violet-glow/8 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground/15" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.02_250)] via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 h-7 w-7 rounded-full bg-background/80 backdrop-blur text-cyan-glow text-[11px] font-bold flex items-center justify-center border border-cyan-glow/20">
                        {i + 1}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-cyan-glow transition-colors duration-300">{article.title}</h3>
                      <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground/35">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{article.likes_count}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time} دقائق</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
              activeCategory === "all"
                ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground border-transparent shadow-[0_0_25px_oklch(0.78_0.18_220/0.15)]"
                : "border-ice-border/15 bg-[oklch(0.14_0.02_250)] text-muted-foreground hover:text-foreground hover:border-cyan-glow/25"
            }`}>
            جميع المقالات
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
                activeCategory === c.slug
                  ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground border-transparent shadow-[0_0_25px_oklch(0.78_0.18_220/0.15)]"
                  : "border-ice-border/15 bg-[oklch(0.14_0.02_250)] text-muted-foreground hover:text-foreground hover:border-cyan-glow/25"
              }`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-14">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="p-2 rounded-xl bg-violet-glow/10"><Sparkles className="h-4 w-4 text-violet-glow" /></div>
          <h2 className="text-xl font-bold">{searchQuery ? "نتائج البحث" : "أحدث المقالات"}</h2>
          {searchQuery && <span className="text-sm text-muted-foreground/40">({filtered.length})</span>}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[420px] rounded-2xl bg-[oklch(0.14_0.02_250)] animate-pulse border border-ice-border/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)]">
            <FileText className="h-14 w-14 text-muted-foreground/15 mx-auto mb-5" />
            <h3 className="text-lg font-bold mb-2">لا توجد مقالات</h3>
            <p className="text-sm text-muted-foreground/40">
              {searchQuery ? "جرب كلمة بحث مختلفة." : "لا توجد مقالات في هذا القسم بعد."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to="/blog/$articleId" params={{ articleId: article.id }} className="group block h-full">
                  <article className="h-full rounded-2xl overflow-hidden border border-ice-border/10 bg-[oklch(0.14_0.02_250)] hover:border-cyan-glow/20 hover:shadow-[0_16px_60px_oklch(0.78_0.18_220/0.06)] transition-all duration-700 flex flex-col">
                    {/* Image */}
                    <div className="relative h-60 overflow-hidden">
                      {article.featured_image ? (
                        <img src={article.featured_image} alt={article.title} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-glow/8 to-violet-glow/8 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.02_250)] via-[oklch(0.14_0.02_250/0.2)] to-transparent" />
                      {(article.article_categories as any) && (
                        <span className="absolute bottom-4 left-4 px-3 py-1 text-[10px] font-bold rounded-full bg-gradient-to-r from-cyan-glow/80 to-violet-glow/80 text-white backdrop-blur-sm tracking-wide">
                          {(article.article_categories as any).name}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg leading-snug mb-3 line-clamp-2 group-hover:text-cyan-glow transition-colors duration-300">
                        {article.title}
                      </h3>
                      {article.short_description && (
                        <p className="text-sm text-muted-foreground/40 line-clamp-2 mb-5 flex-1 leading-relaxed">{article.short_description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground/35 mt-auto pt-4 border-t border-ice-border/8">
                        <div className="flex items-center gap-2.5">
                          {(article.profiles as any)?.avatar_url ? (
                            <img src={(article.profiles as any).avatar_url} alt="" className="h-7 w-7 rounded-full ring-1 ring-ice-border/10" />
                          ) : <User className="h-4 w-4" />}
                          <span className="font-medium">{(article.profiles as any)?.full_name ?? (article.profiles as any)?.username}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{article.likes_count}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time}m</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-ice-border/10 bg-gradient-to-br from-[oklch(0.18_0.04_250)] via-[oklch(0.14_0.02_250)] to-[oklch(0.16_0.04_290)] p-12 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-cyan-glow/4 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-glow/4 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <div className="p-3.5 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/15 w-fit mx-auto mb-6">
              <Mail className="h-7 w-7 text-cyan-glow" />
            </div>
            <h2 className="text-3xl font-bold mb-3">ابقَ على اطلاع</h2>
            <p className="text-muted-foreground/50 mb-8 max-w-md mx-auto leading-relaxed">
              احصل على أحدث المقالات مباشرة في بريدك. بدون إزعاج، فقط محتوى عالي الجودة عن الذكاء الاصطناعي والتقنية.
            </p>
            <div className="flex max-w-md mx-auto gap-3">
              <Input placeholder="بريدك@email.com" className="bg-[oklch(0.12_0.02_250)] border-ice-border/15 h-12" />
              <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground shrink-0 px-7 h-12 font-semibold">
                اشتراك
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
