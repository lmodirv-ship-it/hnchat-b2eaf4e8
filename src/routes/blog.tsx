import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, ArrowRight, FileText, User } from "lucide-react";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { usePublishedArticles, useCategories } from "@/hooks/useBlog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "hnChat Blog — Latest News on AI, Crypto, and Super Apps" },
      { name: "description", content: "Stay updated with the latest articles on AI chat, crypto trading, privacy, community building, and more from the hnChat team." },
      { property: "og:title", content: "hnChat Blog — Latest News" },
      { property: "og:description", content: "Articles on AI, crypto, privacy, and super app technology." },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://hn-chat.com/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: articles = [], isLoading } = usePublishedArticles();
  const { data: categories = [] } = useCategories();

  const filtered = activeCategory === "all"
    ? articles
    : articles.filter((a) => (a.article_categories as any)?.slug === activeCategory);

  return (
    <PublicPageShell dir="ltr">
      {/* Hero */}
      <section className="relative py-16 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-cyan-glow/30 text-cyan-glow mb-4">
            Blog
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Articles &{" "}
            <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover articles on AI, technology, crypto, and more from our community.
          </p>
        </motion.div>
      </section>

      {/* Categories */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
              activeCategory === "all"
                ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground border-transparent"
                : "border-ice-border/20 bg-ice-card/5 text-muted-foreground hover:text-foreground hover:border-cyan-glow/30"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                activeCategory === c.slug
                  ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground border-transparent"
                  : "border-ice-border/20 bg-ice-card/5 text-muted-foreground hover:text-foreground hover:border-cyan-glow/30"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-ice-card/10 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No articles found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/blog/${article.slug}` as any} className="group block">
                  <article className="rounded-2xl overflow-hidden border border-ice-border/15 bg-ice-card/5 hover:border-cyan-glow/30 hover:shadow-[0_8px_40px_oklch(0.78_0.18_220/0.1)] transition-all duration-500">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      {article.featured_image ? (
                        <img src={article.featured_image} alt={article.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 flex items-center justify-center">
                          <FileText className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      {(article.article_categories as any) && (
                        <span className="absolute bottom-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full bg-gradient-to-r from-cyan-glow/80 to-violet-glow/80 text-white">
                          {(article.article_categories as any).name}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-cyan-glow transition-colors">
                        {article.title}
                      </h3>
                      {article.short_description && (
                        <p className="text-sm text-muted-foreground/60 line-clamp-2 mb-3">{article.short_description}</p>
                      )}

                      {/* Author & Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground/50">
                        <div className="flex items-center gap-2">
                          {(article.profiles as any)?.avatar_url ? (
                            <img src={(article.profiles as any).avatar_url} alt="" className="h-5 w-5 rounded-full" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                          <span>{(article.profiles as any)?.full_name ?? (article.profiles as any)?.username}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{article.published_at ? new Date(article.published_at).toLocaleDateString() : ""}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PublicPageShell>
  );
}
