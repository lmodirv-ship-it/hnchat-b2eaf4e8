import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { OwnerShell, OwnerCard, OwnerStat } from "@/components/owner/OwnerShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, FileText, Heart, MessageCircle, Trash2, Loader2, Eye, ChevronLeft, ChevronRight, Image } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_owner/owner-x9k2m7/content")({
  component: ContentPage,
});

const PAGE_SIZE = 20;

function ContentPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<"posts" | "stories">("posts");

  const { data: stats } = useQuery({
    queryKey: ["owner-content-stats"],
    queryFn: async () => {
      const [posts, stories, comments] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("stories").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
      ]);
      return { posts: posts.count ?? 0, stories: stories.count ?? 0, comments: comments.count ?? 0 };
    },
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["owner-content", tab, search, page],
    queryFn: async () => {
      if (tab === "posts") {
        let q = supabase.from("posts").select("*", { count: "exact" })
          .order("created_at", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
        if (search.trim()) q = q.ilike("content", `%${search.trim()}%`);
        const { data, count } = await q;
        // Fetch profiles for these posts
        const userIds = [...new Set((data ?? []).map((p) => p.user_id))];
        const { data: profiles } = userIds.length ? await supabase.from("profiles").select("id, username, avatar_url").in("id", userIds) : { data: [] };
        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
        return { items: (data ?? []).map((p) => ({ ...p, profile: profileMap.get(p.user_id) })), total: count ?? 0 };
      } else {
        let q = supabase.from("stories").select("*", { count: "exact" })
          .order("created_at", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
        const { data, count } = await q;
        const userIds = [...new Set((data ?? []).map((s) => s.user_id))];
        const { data: profiles } = userIds.length ? await supabase.from("profiles").select("id, username, avatar_url").in("id", userIds) : { data: [] };
        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
        return { items: (data ?? []).map((s) => ({ ...s, profile: profileMap.get(s.user_id) })), total: count ?? 0 };
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const table = type === "post" ? "posts" : "stories";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      await supabase.from("owner_audit_logs").insert({
        actor_id: user!.id, action: `${type}.delete`, target_type: type, target_id: id,
      });
    },
    onSuccess: () => { toast.success("تم الحذف"); qc.invalidateQueries({ queryKey: ["owner-content"] }); qc.invalidateQueries({ queryKey: ["owner-content-stats"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const totalPages = Math.ceil((postsData?.total ?? 0) / PAGE_SIZE);

  return (
    <OwnerShell title="Content & Moderation" subtitle="مراجعة وإدارة جميع المحتويات">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <OwnerStat label="المنشورات" value={stats?.posts ?? "—"} icon={FileText} accent="cyan" />
        <OwnerStat label="القصص" value={stats?.stories ?? "—"} icon={Image} accent="amber" />
        <OwnerStat label="التعليقات" value={stats?.comments ?? "—"} icon={MessageCircle} accent="rose" />
      </div>

      <div className="flex gap-2 mb-4">
        {(["posts", "stories"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "ghost"}
            className={tab === t ? "bg-[oklch(0.75_0.18_50)] text-[oklch(0.04_0.01_280)] hover:bg-[oklch(0.7_0.18_50)]" : "text-[oklch(0.6_0.04_40)]"}
            onClick={() => { setTab(t); setPage(0); }}>
            {t === "posts" ? "المنشورات" : "القصص"}
          </Button>
        ))}
      </div>

      <OwnerCard className="p-4 mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.5_0.04_40)]" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="بحث في المحتوى..."
            className="pr-9 bg-transparent border-[oklch(0.18_0.04_30)] text-[oklch(0.9_0.05_50)] placeholder:text-[oklch(0.4_0.04_40)]" />
        </div>
      </OwnerCard>

      <OwnerCard>
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-[oklch(0.75_0.18_50)] mx-auto" /></div>
        ) : (
          <>
            <div className="divide-y divide-[oklch(0.12_0.03_30)]">
              {postsData?.items.map((item: any) => {
                const profile = item.profile;
                return (
                  <div key={item.id} className="p-4 flex gap-3 hover:bg-[oklch(0.08_0.02_30)] transition">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-[oklch(0.15_0.04_30)] text-xs">{(profile?.username ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[oklch(0.85_0.05_50)]">@{profile?.username}</span>
                        <span className="text-xs text-[oklch(0.45_0.04_40)]">{formatDistanceToNow(new Date(item.created_at))} ago</span>
                        {tab === "posts" && (
                          <Badge variant="outline" className="text-[10px] border-[oklch(0.25_0.04_30)] text-[oklch(0.55_0.04_40)]">{item.type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[oklch(0.75_0.04_40)] line-clamp-2">{item.content ?? item.caption ?? "—"}</p>
                      {tab === "posts" && item.media_urls?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {item.media_urls.slice(0, 3).map((url: string, i: number) => (
                            <img key={i} src={url} alt="" className="h-12 w-12 rounded object-cover" />
                          ))}
                          {item.media_urls.length > 3 && <span className="text-xs text-[oklch(0.5_0.04_40)] self-center">+{item.media_urls.length - 3}</span>}
                        </div>
                      )}
                      {tab === "posts" && (
                        <div className="flex gap-4 mt-2 text-xs text-[oklch(0.5_0.04_40)]">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{item.likes_count}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{item.comments_count}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{item.views_count}</span>
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                      onClick={() => deleteMutation.mutate({ id: item.id, type: tab === "posts" ? "post" : "story" })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
              {postsData?.items.length === 0 && (
                <div className="p-12 text-center text-[oklch(0.5_0.04_40)]">لا توجد نتائج</div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-[oklch(0.15_0.03_30)]">
                <span className="text-xs text-[oklch(0.5_0.04_40)]">{postsData?.total} عنصر</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0"><ChevronRight className="h-4 w-4" /></Button>
                  <span className="text-xs text-[oklch(0.6_0.04_40)] self-center px-2">{page + 1}/{totalPages}</span>
                  <Button size="sm" variant="ghost" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </>
        )}
      </OwnerCard>
    </OwnerShell>
  );
}
