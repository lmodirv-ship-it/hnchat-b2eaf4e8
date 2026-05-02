import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Gift, Share2, Users, Twitter, Facebook, MessageCircle, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/invite")({
  component: InvitePage,
});

function InvitePage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["referral-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: referralStats } = useQuery({
    queryKey: ["referral-stats", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, count } = await supabase
        .from("referrals")
        .select("*", { count: "exact" })
        .eq("referrer_id", user!.id);
      const completed = data?.filter((r) => r.status === "completed").length ?? 0;
      return { total: count ?? 0, completed, earned: completed * 5 };
    },
  });

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.hn-chat.com";
  const referralCode = profile?.referral_code ?? "";
  const inviteLink = referralCode ? `${baseUrl}/sign-up-login?ref=${referralCode}` : "";

  const copy = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("تم نسخ رابط الدعوة ✅");
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "انضم إلى hnChat!",
        text: "انضم إلى hnChat — منصة سوبر آب تجمع التواصل والتجارة والذكاء الاصطناعي 🚀",
        url: inviteLink,
      });
    } else {
      copy();
    }
  };

  const shareTwitter = () => {
    const text = encodeURIComponent("انضم إلى hnChat — منصة سوبر آب 🚀");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(inviteLink)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`, "_blank");
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`انضم إلى hnChat 🚀\n${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <PageShell title="Invite & Earn" subtitle="ادعُ أصدقاءك واربح مكافآت 🎁">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 bg-ice-card border-ice-border">
          <Users className="h-6 w-6 text-cyan-glow mb-2" />
          <div className="text-3xl font-bold">{referralStats?.total ?? 0}</div>
          <div className="text-xs text-muted-foreground">دعوة مُرسلة</div>
        </Card>
        <Card className="p-5 bg-ice-card border-ice-border">
          <Gift className="h-6 w-6 text-pink-glow mb-2" />
          <div className="text-3xl font-bold">{referralStats?.completed ?? 0}</div>
          <div className="text-xs text-muted-foreground">صديق منضم</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-violet-glow/20 to-cyan-glow/10 border-violet-glow/30">
          <div className="text-xs text-muted-foreground mb-1">مكافآت مكتسبة</div>
          <div className="text-3xl font-bold text-violet-glow">${referralStats?.earned ?? 0}</div>
        </Card>
      </div>

      <Card className="p-5 bg-ice-card border-ice-border mb-6">
        <div className="text-sm font-semibold mb-3">رابط الدعوة الخاص بك</div>
        <div className="flex gap-2 mb-4">
          <Input value={inviteLink} readOnly className="font-mono text-xs" />
          <Button onClick={copy} variant="outline" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mb-2">شارك عبر</div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={shareNative} size="sm" className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
            <Share2 className="h-4 w-4 mr-1" /> مشاركة
          </Button>
          <Button onClick={shareTwitter} size="sm" variant="outline">
            <Twitter className="h-4 w-4 mr-1" /> Twitter
          </Button>
          <Button onClick={shareFacebook} size="sm" variant="outline">
            <Facebook className="h-4 w-4 mr-1" /> Facebook
          </Button>
          <Button onClick={shareWhatsApp} size="sm" variant="outline">
            <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
          </Button>
        </div>
      </Card>

      <Card className="p-5 bg-ice-card border-ice-border">
        <h3 className="font-semibold mb-3">كيف يعمل نظام الإحالة؟</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-cyan-glow/20 text-cyan-glow flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <div>شارك رابط الدعوة الخاص بك مع أصدقائك</div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-violet-glow/20 text-violet-glow flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <div>عندما يسجل صديقك باستخدام رابطك، يُحتسب لك</div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-pink-glow/20 text-pink-glow flex items-center justify-center text-xs font-bold shrink-0">3</div>
            <div>تحصل على $5 مكافأة لكل صديق ينضم بنجاح 🎉</div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
