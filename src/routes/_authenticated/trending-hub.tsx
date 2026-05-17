import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";
import { TrendingUp, Flame, Users, Heart, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trending-hub")({
  head: () => ({
    meta: [
      { title: "الأكثر انتشاراً — hnChat" },
      { name: "description", content: "أكثر الفيديوهات والحسابات والمنشورات تفاعلاً." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell
      title="Trending"
      subtitle="ما يهز المنصة الآن"
      action={<Flame className="h-5 w-5 text-amber-500" />}
    >
      <Tabs defaultValue="videos">
        <TabsList className="bg-ice-card border border-ice-border mb-4">
          <TabsTrigger value="videos"><Flame className="h-4 w-4 me-1" /> فيديوهات</TabsTrigger>
          <TabsTrigger value="creators"><Users className="h-4 w-4 me-1" /> حسابات صاعدة</TabsTrigger>
          <TabsTrigger value="posts"><Heart className="h-4 w-4 me-1" /> منشورات</TabsTrigger>
        </TabsList>
        <TabsContent value="videos"><TrendingVideos /></TabsContent>
        <TabsContent value="creators"><TrendingCreators /></TabsContent>
        <TabsContent value="posts"><TrendingPosts /></TabsContent>
      </Tabs>
    </PageShell>
  );
}

function TrendingVideos() {
  const { data } = useQuery({
    queryKey: ["trending-videos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, content, media_urls, likes_count, comments_count")
        .eq("type", "video")
        .order("likes_count", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });
  if (!data?.length) return <Empty />;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {data.map((p) => (
        <Card key={p.id} className="aspect-[9/16] bg-ice-card border-ice-border overflow-hidden relative">
          {p.media_urls?.[0] && <video src={p.media_urls[0]} className="w-full h-full object-cover" muted />}
          <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs flex justify-between">
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes_count}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.comments_count}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function TrendingCreators() {
  const { data } = useQuery({
    queryKey: ["trending-creators"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, followers_count")
        .order("followers_count", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });
  if (!data?.length) return <Empty />;
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {data.map((u, i) => (
        <Card key={u.id} className="p-3 bg-ice-card border-ice-border flex items-center gap-3">
          <span className="text-2xl font-black text-amber-500 w-8">#{i + 1}</span>
          {u.avatar_url ? (
            <img src={u.avatar_url} className="w-12 h-12 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-cyan-glow/20" />
          )}
          <div className="flex-1 min-w-0">
            <Link to="/profile/$username" params={{ username: u.username! }} className="font-bold text-sm hover:text-cyan-glow truncate block">
              {u.full_name || u.username}
            </Link>
            <p className="text-xs text-muted-foreground">{u.followers_count ?? 0} متابع</p>
          </div>
          <TrendingUp className="h-4 w-4 text-cyan-glow" />
        </Card>
      ))}
    </div>
  );
}

function TrendingPosts() {
  const { data } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, content, likes_count, comments_count")
        .order("likes_count", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });
  if (!data?.length) return <Empty />;
  return (
    <div className="space-y-3">
      {data.map((p) => (
        <Link key={p.id} to="/post/$id" params={{ id: p.id }}>
          <Card className="p-3 bg-ice-card border-ice-border hover:border-cyan-glow/40">
            <p className="text-sm line-clamp-3">{p.content}</p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes_count}</span>
              <span>{p.comments_count} تعليق</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function Empty() {
  return <p className="text-center text-muted-foreground py-12 text-sm">لا توجد بيانات بعد</p>;
}
