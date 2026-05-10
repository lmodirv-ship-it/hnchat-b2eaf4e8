import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Calendar, Clock, Eye, User } from "lucide-react";
import { usePublishedArticles, useCategories } from "@/hooks/useBlog";
import { optimizedImage } from "@/lib/image";

import aiBrainImg from "@/assets/blog/ai-brain.jpg";
import chatgptImg from "@/assets/blog/chatgpt-tips.jpg";
import cryptoImg from "@/assets/blog/crypto-trading.jpg";
import aiToolsImg from "@/assets/blog/ai-tools.jpg";

// Fallback static articles for when DB is empty
const fallbackArticles = [
  { id: "1", title: "Qu'est-ce que l'IA ? Guide complet pour débutants", titleAr: "ما هو الذكاء الاصطناعي؟ دليل شامل للمبتدئين", titleEn: "What is AI? Complete Beginner's Guide", desc: "Découvrez les bases de l'intelligence artificielle.", category: "Intelligence Artificielle", image: aiBrainImg, date: "5 Mai 2024", readTime: "5 min" },
  { id: "2", title: "10 astuces ChatGPT que vous devez connaître", titleAr: "10 حيل ChatGPT يجب أن تعرفها", titleEn: "10 ChatGPT Tips You Must Know", desc: "Boostez votre productivité avec ces astuces.", category: "ChatGPT", image: chatgptImg, date: "4 Mai 2024", readTime: "7 min" },
  { id: "3", title: "Comment débuter dans le trading crypto en 2024", titleAr: "كيف تبدأ تداول العملات الرقمية", titleEn: "How to Start Crypto Trading", desc: "Guide complet pour bien commencer.", category: "Crypto", image: cryptoImg, date: "3 Mai 2024", readTime: "6 min" },
  { id: "4", title: "Les meilleurs outils IA gratuits en 2024", titleAr: "أفضل أدوات AI المجانية في 2024", titleEn: "Best Free AI Tools in 2024", desc: "Découvrez les outils les plus puissants.", category: "Outils IA", image: aiToolsImg, date: "2 Mai 2024", readTime: "4 min" },
];

const categories = [
  { id: "all", label: "Tous", labelAr: "الكل", labelEn: "All" },
  { id: "ai", label: "Intelligence Artificielle", labelAr: "ذكاء اصطناعي", labelEn: "Artificial Intelligence" },
  { id: "chatgpt", label: "ChatGPT", labelAr: "ChatGPT", labelEn: "ChatGPT" },
  { id: "crypto", label: "Crypto", labelAr: "عملات رقمية", labelEn: "Crypto" },
  { id: "tutorials", label: "Tutoriels", labelAr: "دروس", labelEn: "Tutorials" },
  { id: "news", label: "News", labelAr: "أخبار", labelEn: "News" },
  { id: "tools", label: "Outils IA", labelAr: "أدوات AI", labelEn: "AI Tools" },
];

export function BlogSection({ lang = "fr" }: { lang?: string }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const isRTL = lang === "ar";
  const isEn = lang === "en";

  const { data: dbArticles = [] } = usePublishedArticles({ limit: 4 });

  const getCatLabel = (c: typeof categories[0]) => isRTL ? c.labelAr : isEn ? c.labelEn : c.label;

  const sectionTitle = isRTL ? "المقالات والمدونة" : isEn ? "Articles & Blog" : "Articles & Blog";
  const sectionSub = isRTL
    ? "اكتشف أحدث مقالاتنا حول الذكاء الاصطناعي والتكنولوجيا والمزيد."
    : isEn
    ? "Discover our latest articles on AI, technology and more."
    : "Découvrez nos derniers articles sur l'IA, la technologie et bien plus encore.";
  const viewAll = isRTL ? "عرض جميع المقالات" : isEn ? "View all articles" : "Voir tous les articles";

  // Use DB articles if available, otherwise fallback
  const hasDbArticles = dbArticles.length > 0;

  return (
    <section className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 pt-0 pb-10">
      <div className="rounded-[28px] border border-ice-border/20 bg-ice-card/10 backdrop-blur-2xl shadow-[0_12px_70px_oklch(0_0_0/0.35),0_0_80px_oklch(0.78_0.18_220/0.08)] px-4 sm:px-6 lg:px-8 pt-6 pb-8">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5"
        initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-glow/15 to-violet-glow/10 border border-ice-border/15">
              <FileText className="h-5 w-5 text-cyan-glow" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">{sectionTitle}</h2>
          </div>
          <p className="text-sm text-muted-foreground/60 max-w-lg flex items-center gap-2">
            <span className="text-cyan-glow/40 text-xs">✦⋮⋮</span>
            {sectionSub}
          </p>
        </div>
        <Link to="/blog" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-cyan-glow hover:text-cyan-glow/80 transition-colors group">
          {viewAll}
          <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
        </Link>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 scrollbar-none"
        initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }}
      >
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer border ${
              activeCategory === c.id
                ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground border-transparent shadow-[0_0_20px_oklch(0.78_0.18_220/0.3)]"
                : "border-ice-border/20 bg-ice-card/5 text-muted-foreground hover:text-foreground hover:border-cyan-glow/30 hover:bg-ice-card/10"
            }`}
          >
            {getCatLabel(c)}
          </button>
        ))}
      </motion.div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {hasDbArticles ? (
          dbArticles.slice(0, 4).map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative h-full min-h-[330px] rounded-2xl overflow-hidden border border-ice-border/15 bg-ice-card/5 backdrop-blur-xl transition-all duration-500 hover:border-cyan-glow/30 hover:shadow-[0_8px_40px_oklch(0.78_0.18_220/0.1)] hover:scale-[1.02]"
            >
              <Link to="/blog/$articleId" params={{ articleId: article.short_id ?? article.id }} className="block h-full">
                <div className="relative h-48 sm:h-44 lg:h-48 overflow-hidden rounded-t-2xl">
                  {article.featured_image ? (
                    <img src={optimizedImage(article.featured_image, { width: 500, format: "webp" })} alt={article.title} loading="lazy" decoding="async" width={500} height={300} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  {(article.article_categories as any) && (
                    <span className="absolute bottom-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full bg-gradient-to-r from-cyan-glow/80 to-violet-glow/80 text-white backdrop-blur-sm">
                      {(article.article_categories as any).name}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold leading-snug mb-2 line-clamp-2 group-hover:text-cyan-glow transition-colors duration-300">{article.title}</h3>
                  {article.short_description && (
                    <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 mb-3">{article.short_description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{article.published_at ? new Date(article.published_at).toLocaleDateString() : ""}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time} min</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))
        ) : (
          fallbackArticles.map((article, i) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative h-full min-h-[330px] rounded-2xl overflow-hidden border border-ice-border/15 bg-ice-card/5 backdrop-blur-xl transition-all duration-500 hover:border-cyan-glow/30 hover:shadow-[0_8px_40px_oklch(0.78_0.18_220/0.1)] hover:scale-[1.02]"
            >
              <div className="relative h-48 sm:h-44 lg:h-48 overflow-hidden rounded-t-2xl">
                <img src={article.image} alt={isRTL ? article.titleAr : isEn ? article.titleEn : article.title} loading="lazy" width={768} height={512} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <span className="absolute bottom-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full bg-gradient-to-r from-cyan-glow/80 to-violet-glow/80 text-white backdrop-blur-sm">{article.category}</span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold leading-snug mb-2 line-clamp-2 group-hover:text-cyan-glow transition-colors duration-300">
                  {isRTL ? article.titleAr : isEn ? article.titleEn : article.title}
                </h3>
                <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 mb-3">{article.desc}</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{article.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>

      {/* Mobile "View All" */}
      <div className="sm:hidden mt-6 text-center">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-glow hover:text-cyan-glow/80 transition-colors">
          {viewAll}
          <ArrowRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
        </Link>
      </div>
      </div>
    </section>
  );
}
