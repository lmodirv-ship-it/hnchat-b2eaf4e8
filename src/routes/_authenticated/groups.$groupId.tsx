import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, Send, Loader2, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/groups/$groupId")({
  component: GroupDetailPage,
});

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").eq("id", groupId).single();
      return data;
    },
  });

  const { data: membership } = useQuery({
    queryKey: ["group-member", groupId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("group_members").select("role").eq("group_id", groupId).eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const isAdmin = membership?.role === "admin" || membership?.role === "moderator";
  const isMember = !!membership;

  const { data: posts } = useQuery({
    queryKey: ["group-posts", groupId],
    enabled: isMember,
    queryFn: async () => {
      const { data } = await supabase.from("group_posts").select("*").eq("group_id", groupId).eq("is_hidden", false).order("created_at", { ascending: false }).limit(50);
      const userIds = [...new Set((data ?? []).map((p) => p.user_id))];
      const { data: profs } = userIds.length ? await supabase.from("profiles").select("id, username, full_name, country_code").in("id", userIds) : { data: [] };
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((p) => ({ ...p, profile: map.get(p.user_id) }));
    },
  });

  async function joinGroup() {
    if (!user) return;
    const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: user.id, role: "member" });
    if (error) return toast.error(error.message);
    toast.success("Joined!");
    qc.invalidateQueries({ queryKey: ["group-member", groupId] });
  }

  async function postMsg() {
    if (!content.trim() || !user) return;
    setPosting(true);
    // Auto-tag with group's country/language
    const { error } = await supabase.from("group_posts").insert({
      group_id: groupId, user_id: user.id, content: content.trim(),
      country_code: group?.country_code, language_code: group?.language_code,
    });
    setPosting(false);
    if (error) return toast.error(error.message);
    setContent("");
    qc.invalidateQueries({ queryKey: ["group-posts", groupId] });
  }

  if (!group) return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <PageShell title={group.name} subtitle={group.description ?? undefined} action={
      isAdmin ? (
        <Link to="/groups/$groupId/manage" params={{ groupId }}>
          <Button variant="outline" size="sm"><Settings className="h-4 w-4 me-1.5" /> Manage</Button>
        </Link>
      ) : !isMember ? (
        <Button onClick={joinGroup} className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">Join Group</Button>
      ) : null
    }>
      <Card className="p-4 mb-6 bg-ice-card border-ice-border flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs"><Users className="h-3.5 w-3.5 text-cyan-glow" /> {group.member_count} members</div>
        {group.country_code && <Badge variant="outline" className="text-xs"><MapPin className="h-3 w-3 me-1" /> {group.country_code}</Badge>}
        {group.language_code && <Badge variant="outline" className="text-xs"><Globe className="h-3 w-3 me-1" /> {group.language_code.toUpperCase()}</Badge>}
        {membership && <Badge className="bg-cyan-glow/15 text-cyan-glow border-cyan-glow/30 text-xs">{membership.role}</Badge>}
      </Card>

      {!isMember ? (
        <Card className="p-12 bg-ice-card border-ice-border text-center">
          <Users className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Join this group to see and create posts</p>
        </Card>
      ) : (
        <>
          <Card className="p-4 mb-4 bg-ice-card border-ice-border">
            <Textarea placeholder={`Share with ${group.name}...`} value={content} onChange={(e) => setContent(e.target.value)} className="bg-transparent border-0 resize-none focus-visible:ring-0 min-h-[60px]" />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={postMsg} disabled={!content.trim() || posting} className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5 me-1.5" /> Post</>}
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            {posts?.map((p) => (
              <Card key={p.id} className="p-4 bg-ice-card border-ice-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {p.profile?.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{p.profile?.full_name ?? p.profile?.username}</div>
                    <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(p.created_at))} ago {p.profile?.country_code && `· ${p.profile.country_code}`}</div>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{p.content}</p>
              </Card>
            ))}
            {posts?.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No posts yet</p>}
          </div>
        </>
      )}
    </PageShell>
  );
}
