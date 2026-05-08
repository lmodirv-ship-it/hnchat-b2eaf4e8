import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { OwnerShell, OwnerCard, OwnerStat } from "@/components/owner/OwnerShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, Users, FileText, Loader2, Trash2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_owner/owner-x9k2m7/groups")({
  component: GroupsPage,
});

function GroupsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["owner-group-stats"],
    queryFn: async () => {
      const [total, priv] = await Promise.all([
        supabase.from("groups").select("*", { count: "exact", head: true }),
        supabase.from("groups").select("*", { count: "exact", head: true }).eq("is_private", true),
      ]);
      return { total: total.count ?? 0, private: priv.count ?? 0 };
    },
  });

  const { data: groups, isLoading } = useQuery({
    queryKey: ["owner-groups"],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").order("member_count", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("groups").delete().eq("id", id);
      if (error) throw error;
      await supabase.from("owner_audit_logs").insert({ actor_id: user!.id, action: "group.delete", target_type: "group", target_id: id });
    },
    onSuccess: () => { toast.success("تم حذف المجموعة"); qc.invalidateQueries({ queryKey: ["owner-groups"] }); qc.invalidateQueries({ queryKey: ["owner-group-stats"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <OwnerShell title="Groups Network" subtitle="إدارة جميع المجموعات">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <OwnerStat label="المجموعات" value={stats?.total ?? "—"} icon={Flag} accent="amber" />
        <OwnerStat label="خاصة" value={stats?.private ?? "—"} icon={Lock} accent="rose" />
        <OwnerStat label="عامة" value={(stats?.total ?? 0) - (stats?.private ?? 0)} icon={Unlock} accent="cyan" />
      </div>

      <OwnerCard>
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin text-[oklch(0.75_0.18_50)] mx-auto" /></div>
        ) : (
          <div className="divide-y divide-[oklch(0.12_0.03_30)]">
            {groups?.map((g) => (
              <div key={g.id} className="p-4 flex items-center gap-3 hover:bg-[oklch(0.08_0.02_30)] transition">
                {g.cover_url ? (
                  <img src={g.cover_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-[oklch(0.12_0.03_30)] flex items-center justify-center shrink-0"><Flag className="h-4 w-4 text-[oklch(0.4_0.04_40)]" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[oklch(0.88_0.05_50)]">{g.name}</div>
                  <div className="flex gap-3 text-xs text-[oklch(0.5_0.04_40)]">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{g.member_count}</span>
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{g.post_count}</span>
                    {g.country_code && <span>{g.country_code}</span>}
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${g.is_private ? "border-red-500 text-red-400" : "border-green-500 text-green-400"}`}>
                  {g.is_private ? "خاصة" : "عامة"}
                </Badge>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => deleteGroup.mutate(g.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {groups?.length === 0 && <div className="p-8 text-center text-[oklch(0.5_0.04_40)]">لا توجد مجموعات بعد</div>}
          </div>
        )}
      </OwnerCard>
    </OwnerShell>
  );
}
