import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/trade")({
  component: TradePage,
});

const COINS = ["bitcoin", "ethereum", "solana", "binancecoin", "ripple", "cardano"];

function TradePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["crypto-prices"],
    queryFn: async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(",")}&order=market_cap_desc`
      );
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 30000,
  });

  return (
    <PageShell title="Trade Crypto" subtitle="أسعار العملات الرقمية المباشرة">
      {isLoading && <p className="text-muted-foreground">جاري التحميل...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((c: any) => {
          const up = c.price_change_percentage_24h >= 0;
          return (
            <Card key={c.id} className="p-4 bg-ice-card border-ice-border">
              <div className="flex items-center gap-3">
                <img src={c.image} alt={c.name} className="h-10 w-10" />
                <div className="flex-1">
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs text-muted-foreground uppercase">{c.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold">${c.current_price?.toLocaleString()}</div>
                  <div className={`text-xs flex items-center gap-1 justify-end ${up ? "text-emerald-400" : "text-pink-glow"}`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {c.price_change_percentage_24h?.toFixed(2)}%
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
