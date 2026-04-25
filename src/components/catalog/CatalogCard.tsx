import type { LucideIcon } from "lucide-react";
import { Star, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogItem } from "@/hooks/useCatalog";

export function CatalogCard({
  item,
  icon: Icon,
  ctaLabel = "فتح",
  onAction,
  accent = "cyan",
}: {
  item: CatalogItem;
  icon?: LucideIcon;
  ctaLabel?: string;
  onAction?: (item: CatalogItem) => void;
  accent?: "cyan" | "violet" | "pink";
}) {
  const accentCls =
    accent === "violet"
      ? "from-violet-glow/30 to-pink-glow/20 border-violet-glow/40 text-violet-glow"
      : accent === "pink"
      ? "from-pink-glow/30 to-violet-glow/20 border-pink-glow/40 text-pink-glow"
      : "from-cyan-glow/30 to-violet-glow/20 border-cyan-glow/40 text-cyan-glow";

  return (
    <div className="group relative rounded-2xl border border-ice-border bg-ice-card hover:border-cyan-glow/40 transition-all overflow-hidden">
      {item.is_featured && (
        <span className="absolute top-2 right-2 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded bg-pink-glow/20 text-pink-glow border border-pink-glow/40">
          ⭐ مميّز
        </span>
      )}

      <div className="relative h-32 bg-gradient-to-br from-ice-bg via-ice-card to-cyan-glow/5 flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
        ) : Icon ? (
          <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${accentCls} border flex items-center justify-center shadow-[0_0_30px_oklch(0.78_0.18_220/0.25)]`}>
            <Icon className="h-8 w-8" />
          </div>
        ) : null}
      </div>

      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-sm truncate">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {item.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-pink-glow fill-pink-glow" />
              {Number(item.rating).toFixed(1)}
            </span>
          )}
          {item.downloads_count > 0 && (
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {item.downloads_count >= 1000 ? `${(item.downloads_count / 1000).toFixed(1)}K` : item.downloads_count}
            </span>
          )}
          {item.category && (
            <span className="px-1.5 py-0.5 rounded bg-muted/40 capitalize">{item.category}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-sm font-bold">
            {item.price && Number(item.price) > 0 ? (
              <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
                {Number(item.price).toFixed(2)} {item.currency}
              </span>
            ) : (
              <span className="text-emerald-400">مجاني</span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => onAction?.(item)}
          >
            {ctaLabel}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
