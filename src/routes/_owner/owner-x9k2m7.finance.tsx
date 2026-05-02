import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OwnerShell, OwnerCard, OwnerStat } from "@/components/owner/OwnerShell";
import { DollarSign, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_owner/owner-x9k2m7/finance")({
  component: FinancePage,
});

function FinancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["owner-finance"],
    queryFn: async () => {
      const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
      const allOrders = orders ?? [];
      const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);
      const completed = allOrders.filter((o) => o.status === "delivered" || o.status === "paid");
      const completedRevenue = completed.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);
      const pending = allOrders.filter((o) => o.status === "pending");
      return { totalRevenue, completedRevenue, orderCount: allOrders.length, pendingCount: pending.length, recentOrders: allOrders.slice(0, 20) };
    },
  });

  return (
    <OwnerShell title="Finance" subtitle="نظرة عامة على الإيرادات والمعاملات المالية">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <OwnerStat label="إجمالي الإيرادات" value={`$${(data?.totalRevenue ?? 0).toFixed(2)}`} icon={DollarSign} accent="amber" />
        <OwnerStat label="مكتملة" value={`$${(data?.completedRevenue ?? 0).toFixed(2)}`} icon={TrendingUp} accent="cyan" />
        <OwnerStat label="الطلبات" value={data?.orderCount ?? "—"} icon={ShoppingCart} accent="rose" />
        <OwnerStat label="قيد الانتظار" value={data?.pendingCount ?? "—"} icon={ShoppingCart} accent="amber" />
      </div>

      {isLoading ? (
        <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-[oklch(0.75_0.18_50)] mx-auto" /></div>
      ) : (
        <OwnerCard>
          <div className="p-4 border-b border-[oklch(0.15_0.03_30)]">
            <h2 className="font-semibold text-[oklch(0.9_0.05_50)]">آخر المعاملات</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[oklch(0.55_0.04_40)] text-xs uppercase tracking-wider border-b border-[oklch(0.15_0.03_30)]">
                  <th className="text-right p-3">الحالة</th>
                  <th className="text-right p-3">المبلغ</th>
                  <th className="text-right p-3">طريقة الدفع</th>
                  <th className="text-right p-3">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[oklch(0.12_0.03_30)]">
                {data?.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[oklch(0.08_0.02_30)] transition">
                    <td className="p-3">
                      <Badge variant="outline" className={`text-[10px] ${o.status === "delivered" ? "border-green-500 text-green-400" : o.status === "pending" ? "border-yellow-500 text-yellow-400" : o.status === "cancelled" ? "border-red-500 text-red-400" : "border-[oklch(0.3_0.04_40)] text-[oklch(0.6_0.04_40)]"}`}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium text-[oklch(0.88_0.05_50)]">{o.total_amount} {o.currency}</td>
                    <td className="p-3 text-[oklch(0.6_0.04_40)]">{o.payment_method ?? "—"}</td>
                    <td className="p-3 text-xs text-[oklch(0.5_0.04_40)]">{formatDistanceToNow(new Date(o.created_at))} ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.recentOrders.length === 0 && <div className="p-8 text-center text-[oklch(0.5_0.04_40)]">لا توجد معاملات بعد</div>}
        </OwnerCard>
      )}
    </OwnerShell>
  );
}
