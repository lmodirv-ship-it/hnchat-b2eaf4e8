import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/marketplace")({
  component: MarketplacePage,
});

function MarketplacePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(48);
      return data ?? [];
    },
  });

  return (
    <PageShell title="Marketplace" subtitle="Discover & shop">
      {isLoading && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
      {data?.length === 0 && (
        <Card className="p-12 bg-ice-card border-ice-border text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-pink-glow" />
          <p className="text-muted-foreground">No products listed yet.</p>
        </Card>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.map((p) => (
          <Card key={p.id} className="p-3 bg-ice-card border-ice-border hover:shadow-[0_0_24px_oklch(0.65_0.25_295/0.2)] transition-all">
            <div className="aspect-square rounded-md bg-gradient-to-br from-cyan-glow/10 to-violet-glow/10 mb-2" />
            <div className="font-semibold text-sm truncate">{p.title}</div>
            <div className="text-xs text-muted-foreground">{p.currency} {p.price}</div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
