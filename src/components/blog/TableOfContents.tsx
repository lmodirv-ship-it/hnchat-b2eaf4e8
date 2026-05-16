import { useEffect, useMemo, useState } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";

export type TocItem = { id: string; text: string; level: 2 | 3 };

/**
 * Slugify a heading text into a stable id.
 * Keeps Arabic/Unicode letters, strips most punctuation, lower-cases ASCII.
 */
export function slugifyHeading(text: string, fallbackIndex: number): string {
  const base = (text || "")
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `section-${fallbackIndex + 1}`;
}

/**
 * Extract H2/H3 items from the article markdown.
 * Skips headings inside fenced code blocks.
 */
export function extractToc(markdown: string): TocItem[] {
  if (!markdown) return [];
  const items: TocItem[] = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  let idx = 0;
  const seen = new Map<string, number>();

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const level = m[1].length === 2 ? 2 : 3;
    const text = m[2].trim();
    let id = slugifyHeading(text, idx);
    // ensure uniqueness
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    items.push({ id, text, level: level as 2 | 3 });
    idx += 1;
  }
  return items;
}

function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // pick the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive((visible[0].target as HTMLElement).id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] },
    );
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids.join("|")]);
  return active;
}

export function TableOfContents({
  content,
  isRTL,
}: {
  content: string;
  isRTL: boolean;
}) {
  const items = useMemo(() => extractToc(content), [content]);
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveHeading(ids);
  const [openMobile, setOpenMobile] = useState(false);

  if (items.length < 2) return null;

  const onClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
    setOpenMobile(false);
  };

  const list = (
    <ul className="space-y-1.5 text-sm">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <li key={item.id} className={item.level === 3 ? "pr-3" : ""}>
            <a
              href={`#${item.id}`}
              onClick={(e) => onClick(e, item.id)}
              className={`block py-1.5 px-2.5 rounded-lg leading-snug transition-all border-r-2 ${
                isActive
                  ? "border-cyan-glow text-cyan-glow bg-cyan-glow/5"
                  : "border-transparent text-muted-foreground/60 hover:text-foreground hover:bg-ice-card/10"
              } ${item.level === 3 ? "text-[12.5px] opacity-80" : "font-medium"}`}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop — sticky sidebar on xl+ screens */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-ice-border/10 bg-[oklch(0.13_0.02_250)]/60 backdrop-blur-xl p-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-ice-border/10">
            <div className="p-1.5 rounded-lg bg-cyan-glow/10">
              <List className="h-3.5 w-3.5 text-cyan-glow" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/70">
              {isRTL ? "في هذا المقال" : "On this page"}
            </h4>
          </div>
          {list}
        </div>
      </aside>

      {/* Mobile — collapsible card above content */}
      <div className="lg:hidden mb-8 rounded-2xl border border-ice-border/10 bg-[oklch(0.14_0.02_250)] overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenMobile((v) => !v)}
          className="w-full flex items-center justify-between p-4 text-sm font-bold text-foreground/80"
        >
          <span className="flex items-center gap-2">
            <List className="h-4 w-4 text-cyan-glow" />
            {isRTL ? "في هذا المقال" : "On this page"}
            <span className="text-muted-foreground/40 font-normal">({items.length})</span>
          </span>
          {openMobile ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {openMobile && (
          <div className="px-4 pb-4 border-t border-ice-border/10 pt-3 max-h-[60vh] overflow-y-auto">
            {list}
          </div>
        )}
      </div>
    </>
  );
}
