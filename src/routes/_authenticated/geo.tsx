import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/geo")({
  component: GeoPage,
});

function GeoPage() {
  const { data } = useQuery({
    queryKey: ["geo-content"],
    queryFn: async () => {
      const { data } = await supabase
        .from("group_posts")
        .select("id, content, country_code, language_code, created_at, likes_count")
        .not("country_code", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const grouped = (data ?? []).reduce<Record<string, typeof data>>((acc, p: any) => {
    const k = p.country_code ?? "??";
    (acc[k] ||= [] as any).push(p);
    return acc;
  }, {});

  return (
    <PageShell title="Geo Content" subtitle="محتوى محلي حسب الدولة واللغة">
      {Object.keys(grouped).length === 0 && (
        <Card className="p-12 bg-ice-card border-ice-border text-center">
          <Globe2 className="h-10 w-10 mx-auto mb-3 text-cyan-glow" />
          <p className="text-muted-foreground">لا يوجد محتوى جغرافي بعد</p>
        </Card>
      )}
      <div className="space-y-6">
        {Object.entries(grouped).map(([country, posts]) => (
          <section key={country}>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-cyan-glow" /> {country.toUpperCase()}
              <span className="text-xs text-muted-foreground">({posts!.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {posts!.slice(0, 6).map((p: any) => (
                <Card key={p.id} className="p-4 bg-ice-card border-ice-border">
                  <p className="text-sm line-clamp-2">{p.content}</p>
                  <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                    <span>{p.language_code?.toUpperCase()}</span>
                    <span>{p.likes_count} ❤</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
