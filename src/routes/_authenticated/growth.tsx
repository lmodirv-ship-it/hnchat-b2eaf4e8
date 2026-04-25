import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { StatCard, MetricsTimeChart } from "@/components/catalog/MetricsDashboard";
import { Users, Heart, Eye, UserPlus, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/growth")({
  component: GrowthPage,
});

function GrowthPage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile-growth", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const followers = profile?.followers_count ?? 0;
  const following = profile?.following_count ?? 0;
  const posts = profile?.posts_count ?? 0;

  return (
    <PageShell
      title="Growth Analytics"
      subtitle="تتبّع نمو حسابك ومحتواك"
      action={<BarChart3 className="h-5 w-5 text-cyan-glow" />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="المتابعون" value={followers} delta={5.4} icon={Users} accent="cyan" />
          <StatCard label="المتابَعون" value={following} delta={2.1} icon={UserPlus} accent="violet" />
          <StatCard label="المنشورات" value={posts} delta={12.8} icon={Heart} accent="pink" />
          <StatCard label="مشاهدات" value={`${(posts * 124).toLocaleString()}`} delta={18.3} icon={Eye} accent="emerald" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <MetricsTimeChart metricKey="followers_growth" days={14} label="نمو المتابعين" />
          <MetricsTimeChart metricKey="content_views" days={14} label="مشاهدات المحتوى" />
        </div>
      </div>
    </PageShell>
  );
}
