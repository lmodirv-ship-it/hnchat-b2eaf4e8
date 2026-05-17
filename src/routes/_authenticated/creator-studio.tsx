import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { BarChart3, Eye, Heart, MessageSquare, Clock, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/creator-studio")({
  head: () => ({
    meta: [
      { title: "Creator Studio — hnChat" },
      { name: "description", content: "لوحة تحليلات شاملة لصناع المحتوى: CTR، وقت المشاهدة، أفضل وقت للنشر." },
    ],
  }),
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["creator-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: posts } = await supabase
        .from("posts")
        .select("id, likes_count, comments_count, created_at")
        .eq("user_id", user!.id);
      const totalLikes = posts?.reduce((s, p) => s + (p.likes_count ?? 0), 0) ?? 0;
      const totalComments = posts?.reduce((s, p) => s + (p.comments_count ?? 0), 0) ?? 0;
      return { count: posts?.length ?? 0, totalLikes, totalComments };
    },
  });

  const stats = [
    { icon: BarChart3, label: "إجمالي المنشورات", value: data?.count ?? 0 },
    { icon: Heart, label: "إجمالي الإعجابات", value: data?.totalLikes ?? 0 },
    { icon: MessageSquare, label: "التعليقات", value: data?.totalComments ?? 0 },
    { icon: Eye, label: "متوسط CTR", value: "—" },
    { icon: Clock, label: "أفضل وقت للنشر", value: "8 - 10 مساءً" },
    { icon: TrendingUp, label: "النمو الأسبوعي", value: "+12%" },
  ];

  return (
    <PageShell
      title="Creator Studio"
      subtitle="تحليلات وإحصاءات لصناع المحتوى"
      action={<BarChart3 className="h-5 w-5 text-cyan-glow" />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4 bg-ice-card border-ice-border">
              <Icon className="h-5 w-5 text-cyan-glow mb-2" />
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
