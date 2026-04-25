import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/search")({
  component: () => (
    <PageShell title="Search" subtitle="ابحث عبر hnChat — أشخاص، منشورات، فيديوهات، منتجات">
      <div className="relative max-w-2xl mx-auto mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن أي شيء..."
          className="pl-10 bg-ice-card border-ice-border h-12 text-base"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {[
          { label: "الأشخاص", to: "/explore" },
          { label: "المنشورات", to: "/feed" },
          { label: "الفيديوهات", to: "/videos" },
          { label: "المنتجات", to: "/marketplace" },
        ].map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="p-4 rounded-xl bg-ice-card border border-ice-border hover:border-cyan-glow/40 text-center text-sm transition-colors"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </PageShell>
  ),
});
