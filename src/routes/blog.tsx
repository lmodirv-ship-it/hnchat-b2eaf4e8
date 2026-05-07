import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, ArrowRight, FileText, User, TrendingUp, Sparkles, Mail } from "lucide-react";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { usePublishedArticles, useCategories } from "@/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const featured = articles[0];
  const trending = articles.slice(0, 4);
  const latest = filtered;

  return (
    <PublicPageShell dir="ltr">
      {/* Hero */}
      <section className="relative py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-glow/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-glow/5 rounded-full blur-[120px]" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-violet-glow/5 rounded-full blur-[100px]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-full border border-cyan-glow/30 text-cyan-glow mb-5 bg-cyan-glow/5">
            hnChat Blog
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold mb-5 leading-tight">
            Discover the Future of{" "}
            <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">AI & Tech</span>
          </h1>
          <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto">
            Expert articles on artificial intelligence, cryptocurrency, privacy, and the next generation of social technology.
          </p>
        </motion.div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <Link to={`/blog/${featured.slug}` as any} className="group block">
            <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="relative rounded-3xl overflow-hidden border border-ice-border/15 bg-ice-card/5 hover:border-cyan-glow/30 transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-96 overflow-hidden">
                  {featured.featured_image ? (
                    <img src={featured.featured_image} alt={featured.title} loading="eager"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/40 lg:block hidden" />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 text-[10px] font-bold rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow text-white w-fit mb-4">
                    FEATURED
                  </span>
                  {(featured.article_categories as any) && (
                    <span className="text-xs text-cyan-glow font-semibold mb-2">{(featured.article_categories as any).name}</span>
                  )}
                  <h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight group-hover:text-cyan-glow transition-colors">
                    {featured.title}
                  </h2>
                  {featured.short_description && (
                    <p className="text-muted-foreground/60 mb-4 line-clamp-3">{featured.short_description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground/50">
                    <div className="flex items-center gap-2">
                      {(featured.profiles as any)?.avatar_url ? (
                        <img src={(featured.profiles as any).avatar_url} alt="" className="h-8 w-8 rounded-full" />
                      ) : <div className="h-8 w-8 rounded-full bg-ice-card/20 flex items-center justify-center"><User className="h-4 w-4" /></div>}
                      <span className="font-medium text-foreground/70">{(featured.profiles as any)?.full_name ?? (featured.profiles as any)?.username}</span>
                    </div>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{featured.published_at ? new Date(featured.published_at).toLocaleDateString() : ""}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.reading_time} min</span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{featured.views_count}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          </Link>
        </section>
      )}

      {/* Trending */}
      {trending.length > 1 && (
        <section className="max-w-7xl mx-auto px-6 mb-14">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-cyan-glow" />
            <h2 className="text-xl font-bold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/blog/${article.slug}` as any} className="group block">
                  <article className="rounded-2xl overflow-hidden border border-ice-border/15 bg-ice-card/5 hover:border-cyan-glow/30 hover:shadow-[0_8px_40px_oklch(0.78_0.18_220/0.08)] transition-all duration-500">
                    <div className="relative h-40 overflow-hidden">
                      {article.featured_image ? (
                        <img src={article.featured_image} alt={article.title} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-background/80 backdrop-blur text-cyan-glow border border-cyan-glow/20">
                        #{i + 1}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-cyan-glow transition-colors">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/40">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time} min</span>
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
              activeCategory === "all"
                ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground border-transparent shadow-[0_0_20px_oklch(0.78_0.18_220/0.2)]"
                : "border-ice-border/20 bg-ice-card/5 text-muted-foreground hover:text-foreground hover:border-cyan-glow/30"
            }`}>
            All Articles
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                activeCategory === c.slug
                  ? "bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground border-transparent shadow-[0_0_20px_oklch(0.78_0.18_220/0.2)]"
                  : "border-ice-border/20 bg-ice-card/5 text-muted-foreground hover:text-foreground hover:border-cyan-glow/30"
              }`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Latest Articles Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-violet-glow" />
          <h2 className="text-xl font-bold">Latest Articles</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-ice-card/10 animate-pulse" />
            ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No articles found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/blog/${article.slug}` as any} className="group block h-full">
                  <article className="h-full rounded-2xl overflow-hidden border border-ice-border/15 bg-ice-card/5 hover:border-cyan-glow/30 hover:shadow-[0_12px_50px_oklch(0.78_0.18_220/0.1)] transition-all duration-500 flex flex-col">
                    {/* Large Image */}
                    <div className="relative h-56 overflow-hidden">
                      {article.featured_image ? (
                        <img src={article.featured_image} alt={article.title} loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 flex items-center justify-center">
                          <FileText className="h-10 w-10 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      {(article.article_categories as any) && (
                        <span className="absolute bottom-3 left-3 px-3 py-1 text-[10px] font-bold rounded-full bg-gradient-to-r from-cyan-glow/80 to-violet-glow/80 text-white backdrop-blur-sm">
                          {(article.article_categories as any).name}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-cyan-glow transition-colors">
                        {article.title}
                      </h3>
                      {article.short_description && (
                        <p className="text-sm text-muted-foreground/50 line-clamp-2 mb-4 flex-1">{article.short_description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground/40 mt-auto pt-3 border-t border-ice-border/10">
                        <div className="flex items-center gap-2">
                          {(article.profiles as any)?.avatar_url ? (
                            <img src={(article.profiles as any).avatar_url} alt="" className="h-6 w-6 rounded-full" />
                          ) : <User className="h-4 w-4" />}
                          <span>{(article.profiles as any)?.full_name ?? (article.profiles as any)?.username}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{article.published_at ? new Date(article.published_at).toLocaleDateString() : ""}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.reading_time} min</span>
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
        <div className="rounded-3xl border border-ice-border/15 bg-gradient-to-br from-cyan-glow/5 via-ice-card/5 to-violet-glow/5 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/3 w-64 h-64 bg-cyan-glow/5 rounded-full blur-[80px]" />
          <Mail className="h-10 w-10 text-cyan-glow mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
          <p className="text-muted-foreground/60 mb-6 max-w-md mx-auto">
            Get the latest articles delivered to your inbox. No spam, just quality content.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <Input placeholder="your@email.com" className="bg-ice-card/10 border-ice-border/20" />
            <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground shrink-0 px-6">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
