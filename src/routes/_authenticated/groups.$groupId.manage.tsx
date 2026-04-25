import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, MapPin, EyeOff, Eye, Pin, Trash2, Loader2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/groups/$groupId/manage")({
  component: GroupManagePage,
});

function GroupManagePage() {
  const { groupId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => (await supabase.from("groups").select("*").eq("id", groupId).single()).data,
  });

  const { data: membership, isLoading: memLoading } = useQuery({
    queryKey: ["group-member", groupId, user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("group_members").select("role").eq("group_id", groupId).eq("user_id", user!.id).maybeSingle()).data,
  });

  useEffect(() => {
    if (!memLoading && membership && membership.role !== "admin" && membership.role !== "moderator") {
      navigate({ to: "/groups/$groupId", params: { groupId } });
    }
  }, [memLoading, membership, navigate, groupId]);

  const { data: posts, refetch: refetchPosts } = useQuery({
    queryKey: ["mgmt-posts", groupId],
    queryFn: async () => {
      const { data } = await supabase.from("group_posts").select("*").eq("group_id", groupId).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const { data: members } = useQuery({
    queryKey: ["mgmt-members", groupId],
    queryFn: async () => {
      const { data } = await supabase.from("group_members").select("*").eq("group_id", groupId).order("joined_at", { ascending: false });
      const userIds = (data ?? []).map((m) => m.user_id);
      const { data: profs } = userIds.length ? await supabase.from("profiles").select("id, username, country_code, language_code").in("id", userIds) : { data: [] };
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((m) => ({ ...m, profile: map.get(m.user_id) }));
    },
  });

  // Aggregate stats by country and language
  const countryStats = new Map<string, number>();
  const langStats = new Map<string, number>();
  members?.forEach((m) => {
    if (m.profile?.country_code) countryStats.set(m.profile.country_code, (countryStats.get(m.profile.country_code) ?? 0) + 1);
    if (m.profile?.language_code) langStats.set(m.profile.language_code, (langStats.get(m.profile.language_code) ?? 0) + 1);
  });

  async function togglePost(id: string, field: "is_hidden" | "is_pinned", val: boolean) {
    const update = field === "is_hidden" ? { is_hidden: val } : { is_pinned: val };
    const { error } = await supabase.from("group_posts").update(update).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    refetchPosts();
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("group_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetchPosts();
  }

  if (!group || memLoading) return <Loader2 className="h-6 w-6 animate-spin mx-auto mt-12" />;

  return (
    <PageShell title={`Manage · ${group.name}`} subtitle="Group admin dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-4 bg-ice-card border-ice-border">
          <div className="text-xs text-muted-foreground">Members</div>
          <div className="text-2xl font-bold mt-1">{group.member_count}</div>
        </Card>
        <Card className="p-4 bg-ice-card border-ice-border">
          <div className="text-xs text-muted-foreground">Posts</div>
          <div className="text-2xl font-bold mt-1">{group.post_count}</div>
        </Card>
        <Card className="p-4 bg-ice-card border-ice-border">
          <div className="text-xs text-muted-foreground">Countries</div>
          <div className="text-2xl font-bold mt-1">{countryStats.size}</div>
        </Card>
        <Card className="p-4 bg-ice-card border-ice-border">
          <div className="text-xs text-muted-foreground">Languages</div>
          <div className="text-2xl font-bold mt-1">{langStats.size}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 bg-ice-card border-ice-border">
          <div className="flex items-center gap-2 mb-3"><MapPin className="h-4 w-4 text-cyan-glow" /><h3 className="font-semibold text-sm">Members by Country</h3></div>
          {countryStats.size === 0 ? <p className="text-xs text-muted-foreground">No data</p> : (
            <div className="space-y-2">
              {[...countryStats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([c, n]) => {
                const pct = (n / (members?.length || 1)) * 100;
                return (
                  <div key={c}>
                    <div className="flex justify-between text-xs mb-1"><span>{c}</span><span className="text-muted-foreground">{n} · {pct.toFixed(0)}%</span></div>
                    <div className="h-1.5 bg-muted/30 rounded overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-glow to-violet-glow" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-4 bg-ice-card border-ice-border">
          <div className="flex items-center gap-2 mb-3"><Globe className="h-4 w-4 text-violet-glow" /><h3 className="font-semibold text-sm">Members by Language</h3></div>
          {langStats.size === 0 ? <p className="text-xs text-muted-foreground">No data</p> : (
            <div className="space-y-2">
              {[...langStats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([c, n]) => {
                const pct = (n / (members?.length || 1)) * 100;
                return (
                  <div key={c}>
                    <div className="flex justify-between text-xs mb-1"><span className="uppercase">{c}</span><span className="text-muted-foreground">{n} · {pct.toFixed(0)}%</span></div>
                    <div className="h-1.5 bg-muted/30 rounded overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-glow to-pink-glow" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4 bg-ice-card border-ice-border mb-6">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Posts Moderation</h3>
        <div className="divide-y divide-border">
          {posts?.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No posts</p>}
          {posts?.map((p) => (
            <div key={p.id} className="py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2 mb-1">{p.content}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  {p.is_pinned && <Badge variant="outline" className="text-[9px] py-0">Pinned</Badge>}
                  {p.is_hidden && <Badge variant="outline" className="text-[9px] py-0 text-destructive border-destructive/40">Hidden</Badge>}
                  {p.country_code && <span>{p.country_code}</span>}
                  <span>{p.likes_count} likes</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => togglePost(p.id, "is_pinned", !p.is_pinned)} className="p-1.5 hover:bg-accent rounded"><Pin className="h-3.5 w-3.5" /></button>
                <button onClick={() => togglePost(p.id, "is_hidden", !p.is_hidden)} className="p-1.5 hover:bg-accent rounded">
                  {p.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => deletePost(p.id)} className="p-1.5 hover:bg-destructive/15 hover:text-destructive rounded"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-ice-card border-ice-border">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> Members ({members?.length ?? 0})</h3>
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {members?.map((m) => (
            <div key={m.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {m.profile?.username?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <div className="text-sm font-medium">@{m.profile?.username ?? "unknown"}</div>
                  <div className="text-[10px] text-muted-foreground">{m.profile?.country_code} · {m.profile?.language_code?.toUpperCase()}</div>
                </div>
              </div>
              <Badge variant={m.role === "admin" ? "default" : "outline"} className="text-[10px]">{m.role}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
