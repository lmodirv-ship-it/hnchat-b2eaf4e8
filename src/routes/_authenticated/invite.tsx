import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Gift, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/invite")({
  component: InvitePage,
});

function InvitePage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const inviteLink = userId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/auth/signup?ref=${userId.slice(0, 8)}`
    : "";

  const { data: stats } = useQuery({
    queryKey: ["invite-stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId!);
      return { invited: count ?? 0, earned: (count ?? 0) * 5 };
    },
  });

  const copy = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("تم نسخ رابط الدعوة");
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: "انضم إلى hnChat", url: inviteLink });
    } else copy();
  };

  return (
    <PageShell title="Invite & Earn" subtitle="ادعُ أصدقاءك واربح مكافآت 🎁">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 bg-ice-card border-ice-border">
          <Users className="h-6 w-6 text-cyan-glow mb-2" />
          <div className="text-3xl font-bold">{stats?.invited ?? 0}</div>
          <div className="text-xs text-muted-foreground">صديق منضم</div>
        </Card>
        <Card className="p-5 bg-ice-card border-ice-border">
          <Gift className="h-6 w-6 text-pink-glow mb-2" />
          <div className="text-3xl font-bold">${stats?.earned ?? 0}</div>
          <div className="text-xs text-muted-foreground">مكافآت مكتسبة</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-violet-glow/20 to-cyan-glow/10 border-violet-glow/30">
          <div className="text-xs text-muted-foreground mb-1">المكافأة لكل دعوة</div>
          <div className="text-3xl font-bold text-violet-glow">$5</div>
        </Card>
      </div>

      <Card className="p-5 bg-ice-card border-ice-border">
        <div className="text-sm font-semibold mb-3">رابط الدعوة الخاص بك</div>
        <div className="flex gap-2">
          <Input value={inviteLink} readOnly className="font-mono text-xs" />
          <Button onClick={copy} variant="outline"><Copy className="h-4 w-4" /></Button>
          <Button onClick={share}><Share2 className="h-4 w-4" /></Button>
        </div>
      </Card>
    </PageShell>
  );
}
