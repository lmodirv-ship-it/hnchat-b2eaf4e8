import { useState } from "react";
import { Search, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCatalog, useCatalogCategories, type CatalogItem, type CatalogType } from "@/hooks/useCatalog";
import { CatalogCard } from "./CatalogCard";
import type { LucideIcon } from "lucide-react";

export function CatalogGrid({
  type,
  emptyText = "لا توجد عناصر بعد",
  cardIcon,
  ctaLabel,
  onAction,
  accent,
  showSearch = true,
  showCategories = true,
}: {
  type: CatalogType;
  emptyText?: string;
  cardIcon?: LucideIcon;
  ctaLabel?: string;
  onAction?: (item: CatalogItem) => void;
  accent?: "cyan" | "violet" | "pink";
  showSearch?: boolean;
  showCategories?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const { data: items = [], isLoading } = useCatalog(type, { search, category });
  const { data: categories = [] } = useCatalogCategories(type);

  return (
    <div className="space-y-4">
      {(showSearch || (showCategories && categories.length > 0)) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="ابحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9 bg-ice-card border-ice-border"
              />
            </div>
          )}
          {showCategories && categories.length > 0 && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-ice-card border border-ice-border overflow-x-auto">
              <button
                onClick={() => setCategory(null)}
                className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                  category === null ? "bg-cyan-glow/20 text-cyan-glow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                الكل
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded text-xs capitalize whitespace-nowrap transition-colors ${
                    category === c ? "bg-cyan-glow/20 text-cyan-glow" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-ice-card border border-ice-border animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-ice-border bg-ice-card p-12 text-center">
          <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <CatalogCard
              key={item.id}
              item={item}
              icon={cardIcon}
              ctaLabel={ctaLabel}
              onAction={onAction}
              accent={accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
