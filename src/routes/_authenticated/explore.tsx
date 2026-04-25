import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, TrendingUp, Hash, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/explore")({
  component: ExplorePage,
});

function ExplorePage() {
  const [q, setQ] = useState("");

  const { data: trending } = useQuery({
    queryKey: ["explore-trending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, content, likes_count, comments_count, user_id, created_at")
        .order("likes_count", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const { data: people } = useQuery({
    queryKey: ["explore-people", q],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, followers_count, is_verified")
        .order("followers_count", { ascending: false })
        .limit(12);
      if (q.trim()) query = query.ilike("username", `%${q.trim()}%`);
      const { data } = await query;
      return data ?? [];
    },
  });

  return (
    <PageShell title="Explore" subtitle="اكتشف الأشخاص والمحتوى الرائج">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن أشخاص..."
          className="pl-10 bg-ice-card border-ice-border"
        />
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-glow" /> أشخاص نشطون
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {people?.map((p) => (
            <Link
              key={p.id}
              to="/profile"
              className="rounded-xl border border-ice-border bg-ice-card p-4 text-center hover:border-cyan-glow/50 transition-all"
            >
              <Avatar className="h-14 w-14 mx-auto mb-2">
                <AvatarImage src={p.avatar_url ?? undefined} />
                <AvatarFallback>{p.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-sm font-semibold truncate">@{p.username}</div>
              <div className="text-xs text-muted-foreground">{p.followers_count ?? 0} متابع</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-pink-glow" /> منشورات رائجة
        </h2>
        <div className="space-y-3">
          {trending?.map((post) => (
            <div key={post.id} className="rounded-xl border border-ice-border bg-ice-card p-4">
              <p className="text-sm line-clamp-3">{post.content}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{post.likes_count} إعجاب</span>
                <span>{post.comments_count} تعليق</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
