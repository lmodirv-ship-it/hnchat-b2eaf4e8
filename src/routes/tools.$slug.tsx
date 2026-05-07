import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, ExternalLink, Check, X, ArrowRight, Crown } from "lucide-react";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { useAiTool } from "@/hooks/useAiTools";

export const Route = createFileRoute("/tools/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — أدوات AI | hnChat` },
      { name: "description", content: `مراجعة شاملة لأداة ${params.slug} — المميزات والعيوب والأسعار` },
      { property: "og:title", content: `${params.slug} — أدوات AI | hnChat` },
      { property: "og:description", content: `مراجعة شاملة لأداة ${params.slug}` },
    ],
  }),
  component: ToolDetailPage,
});

function ToolDetailPage() {
  const { slug } = Route.useParams();
  const { data: tool, isLoading } = useAiTool(slug);

  if (isLoading) {
    return (
      <PublicPageShell dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="h-64 rounded-2xl bg-card/30 animate-pulse" />
        </div>
      </PublicPageShell>
    );
  }

  if (!tool) {
    return (
      <PublicPageShell dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">الأداة غير موجودة</h1>
          <Link to="/tools" className="text-primary hover:underline">
            العودة لدليل الأدوات
          </Link>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell dir="rtl">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/tools" className="hover:text-primary">أدوات AI</Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <span className="text-foreground">{tool.name}</span>
        </div>

        {/* Header Card */}
        <div className="rounded-2xl border border-border/20 bg-card/40 backdrop-blur-sm p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              {tool.logo_url ? (
                <img src={tool.logo_url} alt={tool.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{tool.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black text-foreground">{tool.name}</h1>
                {tool.is_featured && (
                  <Badge className="gap-1 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    <Crown className="w-3 h-3" /> مُميّز
                  </Badge>
                )}
                <Badge variant={tool.is_free ? "default" : "secondary"}>
                  {tool.is_free ? "مجاني" : "مدفوع"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(Number(tool.rating)) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground mr-1">{Number(tool.rating).toFixed(1)}</span>
                </div>
                {tool.category_slug && (
                  <span className="text-sm text-primary/70">{tool.category_slug.replace("-", " ")}</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">
            {tool.long_description || tool.description}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            {tool.website_url && (
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2">
                  زيارة الموقع <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}
            {tool.pricing_info && (
              <span className="text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg">
                💰 {tool.pricing_info}
              </span>
            )}
          </div>
        </div>

        {/* Pros & Cons */}
        {((tool.pros && tool.pros.length > 0) || (tool.cons && tool.cons.length > 0)) && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {tool.pros && tool.pros.length > 0 && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
                <h3 className="font-bold text-green-400 mb-3">✅ المميزات</h3>
                <ul className="space-y-2">
                  {tool.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons && tool.cons.length > 0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                <h3 className="font-bold text-red-400 mb-3">❌ العيوب</h3>
                <ul className="space-y-2">
                  {tool.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Newsletter */}
        <NewsletterSignup source="tool-detail" />
      </div>
    </PublicPageShell>
  );
}
