import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Star, ExternalLink, Sparkles, Crown } from "lucide-react";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { useAiTools, useAiToolCategories, type AiTool } from "@/hooks/useAiTools";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "دليل أدوات الذكاء الاصطناعي — hnChat" },
      { name: "description", content: "اكتشف أفضل أدوات الذكاء الاصطناعي للكتابة والتصميم والبرمجة والإنتاجية. تقييمات ومقارنات شاملة." },
      { property: "og:title", content: "دليل أدوات الذكاء الاصطناعي — hnChat" },
      { property: "og:description", content: "اكتشف أفضل أدوات الذكاء الاصطناعي للكتابة والتصميم والبرمجة والإنتاجية." },
    ],
  }),
  component: ToolsIndexPage,
});

function ToolCard({ tool }: { tool: AiTool }) {
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className="group rounded-2xl border border-border/20 bg-card/40 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card/60 transition-all duration-300"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          {tool.logo_url ? (
            <img src={tool.logo_url} alt={tool.name} className="w-8 h-8 rounded-lg object-cover" loading="lazy" />
          ) : (
            <Sparkles className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground truncate">{tool.name}</h3>
            {tool.is_featured && <Crown className="w-4 h-4 text-yellow-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-muted-foreground">{Number(tool.rating).toFixed(1)}</span>
            </div>
            <Badge variant={tool.is_free ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
              {tool.is_free ? "مجاني" : "مدفوع"}
            </Badge>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tool.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-primary/70">{tool.category_slug?.replace("-", " ")}</span>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}

function ToolsIndexPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data: tools = [], isLoading } = useAiTools(activeCategory);
  const { data: categories = [] } = useAiToolCategories();

  const filtered = search
    ? tools.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      )
    : tools;

  return (
    <PublicPageShell dir="rtl">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            🛠️ دليل أدوات الذكاء الاصطناعي
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            اكتشف أفضل أدوات AI المتاحة — مُصنّفة ومُقيّمة لمساعدتك في اختيار الأنسب
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن أداة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 bg-card/50 border-border/30"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 pb-4 overflow-x-auto mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              !activeCategory ? "bg-primary text-primary-foreground" : "bg-card/50 text-muted-foreground hover:text-foreground border border-border/20"
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-card/50 text-muted-foreground hover:text-foreground border border-border/20"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-card/30 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">لا توجد أدوات مطابقة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-16">
          <NewsletterSignup source="tools-page" />
        </div>
      </div>
    </PublicPageShell>
  );
}
