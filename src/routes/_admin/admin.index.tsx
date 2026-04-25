import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Users, FileText, ShoppingBag, MessageCircle, Heart, TrendingUp, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/")({
  component: AdminOverview,
});

function StatCard({ icon: Icon, label, value, gradient }: { icon: any; label: string; value: number | string; gradient: string }) {
  return (
    <Card className="p-5 bg-ice-card border-ice-border backdrop-blur-xl relative overflow-hidden">
      <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="text-3xl font-bold mt-2 bg-gradient-to-r from-foreground to-cyan-glow bg-clip-text text-transparent">{value}</div>
        </div>
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
      </div>
    </Card>
  );
}

function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, posts, products, messages, likes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("likes").select("*", { count: "exact", head: true }),
      ]);
      return {
        users: users.count ?? 0,
        posts: posts.count ?? 0,
        products: products.count ?? 0,
        messages: messages.count ?? 0,
        likes: likes.count ?? 0,
      };
    },
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-glow via-foreground to-cyan-glow bg-clip-text text-transparent">
          Owner Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Full visibility into the hnChat universe</p>
      </div>

      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon={Users} label="Users" value={data!.users} gradient="from-cyan-glow to-primary-glow" />
            <StatCard icon={FileText} label="Posts" value={data!.posts} gradient="from-violet-glow to-cyan-glow" />
            <StatCard icon={ShoppingBag} label="Products" value={data!.products} gradient="from-pink-glow to-violet-glow" />
            <StatCard icon={MessageCircle} label="Messages" value={data!.messages} gradient="from-cyan-glow to-violet-glow" />
            <StatCard icon={Heart} label="Likes" value={data!.likes} gradient="from-pink-glow to-cyan-glow" />
          </div>

          <Card className="p-6 bg-ice-card border-ice-border backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-cyan-glow" />
              <h2 className="font-semibold">System Status</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><div className="text-muted-foreground text-xs">Database</div><div className="text-cyan-glow">● Healthy</div></div>
              <div><div className="text-muted-foreground text-xs">Auth</div><div className="text-cyan-glow">● Online</div></div>
              <div><div className="text-muted-foreground text-xs">Realtime</div><div className="text-cyan-glow">● Connected</div></div>
              <div><div className="text-muted-foreground text-xs">AI Gateway</div><div className="text-cyan-glow">● Ready</div></div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
