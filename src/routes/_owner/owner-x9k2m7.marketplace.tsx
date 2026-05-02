import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { OwnerShell, OwnerCard, OwnerStat } from "@/components/owner/OwnerShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package, DollarSign, Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_owner/owner-x9k2m7/marketplace")({
  component: MarketplacePage,
});

function MarketplacePage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["owner-market-stats"],
    queryFn: async () => {
      const [products, orders, active] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);
      return { products: products.count ?? 0, orders: orders.count ?? 0, active: active.count ?? 0 };
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["owner-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(50);
      const sellerIds = [...new Set((data ?? []).map((p) => p.seller_id))];
      const { data: profiles } = sellerIds.length ? await supabase.from("profiles").select("id, username").in("id", sellerIds) : { data: [] };
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((p) => ({ ...p, seller_username: profileMap.get(p.seller_id)?.username }));
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["owner-recent-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("products").update({ is_active: active }).eq("id", id);
      if (error) throw error;
      await supabase.from("owner_audit_logs").insert({ actor_id: user!.id, action: active ? "product.activate" : "product.deactivate", target_type: "product", target_id: id });
    },
    onSuccess: () => { toast.success("تم التحديث"); qc.invalidateQueries({ queryKey: ["owner-products"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      await supabase.from("owner_audit_logs").insert({ actor_id: user!.id, action: "product.delete", target_type: "product", target_id: id });
    },
    onSuccess: () => { toast.success("تم الحذف"); qc.invalidateQueries({ queryKey: ["owner-products"] }); qc.invalidateQueries({ queryKey: ["owner-market-stats"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <OwnerShell title="Commerce & Revenue" subtitle="إدارة المنتجات والطلبات">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <OwnerStat label="المنتجات" value={stats?.products ?? "—"} icon={Package} accent="cyan" />
        <OwnerStat label="نشط" value={stats?.active ?? "—"} icon={ShoppingBag} accent="amber" />
        <OwnerStat label="الطلبات" value={stats?.orders ?? "—"} icon={DollarSign} accent="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <OwnerCard>
            <div className="p-4 border-b border-[oklch(0.15_0.03_30)]">
              <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">المنتجات</h2>
            </div>
            {isLoading ? (
              <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-[oklch(0.75_0.18_50)] mx-auto" /></div>
            ) : (
              <div className="divide-y divide-[oklch(0.12_0.03_30)]">
                {(products as any[])?.map((p: any) => (
                  <div key={p.id} className="p-3 flex items-center gap-3 hover:bg-[oklch(0.08_0.02_30)] transition">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-[oklch(0.12_0.03_30)] flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-[oklch(0.4_0.04_40)]" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[oklch(0.88_0.05_50)] truncate">{p.title}</div>
                      <div className="text-xs text-[oklch(0.5_0.04_40)]">@{p.profiles?.username} · {p.price} {p.currency}</div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${p.is_active ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}`}>
                      {p.is_active ? "نشط" : "متوقف"}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleActive.mutate({ id: p.id, active: !p.is_active })}>
                      {p.is_active ? <EyeOff className="h-3.5 w-3.5 text-[oklch(0.6_0.04_40)]" /> : <Eye className="h-3.5 w-3.5 text-cyan-glow" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => deleteProduct.mutate(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {products?.length === 0 && <div className="p-8 text-center text-[oklch(0.5_0.04_40)]">لا توجد منتجات بعد</div>}
              </div>
            )}
          </OwnerCard>
        </div>

        <OwnerCard>
          <div className="p-4 border-b border-[oklch(0.15_0.03_30)]">
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">آخر الطلبات</h2>
          </div>
          <div className="divide-y divide-[oklch(0.12_0.03_30)]">
            {recentOrders?.map((o) => (
              <div key={o.id} className="p-3">
                <div className="flex justify-between text-sm">
                  <Badge variant="outline" className={`text-[10px] ${o.status === "delivered" ? "border-green-500 text-green-400" : o.status === "pending" ? "border-yellow-500 text-yellow-400" : "border-[oklch(0.3_0.04_40)] text-[oklch(0.6_0.04_40)]"}`}>{o.status}</Badge>
                  <span className="font-medium text-[oklch(0.85_0.05_50)]">{o.total_amount} {o.currency}</span>
                </div>
                <div className="text-xs text-[oklch(0.45_0.04_40)] mt-1">{formatDistanceToNow(new Date(o.created_at))} ago</div>
              </div>
            ))}
            {recentOrders?.length === 0 && <div className="p-6 text-center text-xs text-[oklch(0.5_0.04_40)]">لا توجد طلبات</div>}
          </div>
        </OwnerCard>
      </div>
    </OwnerShell>
  );
}
