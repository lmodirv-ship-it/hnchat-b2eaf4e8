import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Copy, Check, Share2, Users, Gift, TrendingUp, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { HnLogo } from "@/components/HnLogo";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/referral")({
  component: ReferralPage,
});

function ReferralPage() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const loadReferral = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single();
      if (profile?.referral_code) setReferralCode(profile.referral_code);

      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id)
        .eq("status", "completed");
      setReferralCount(count || 0);
    };
    loadReferral();
  }, [user]);

  const referralLink = `https://hn-chat.com/sign-up-login?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("تم نسخ رابط الدعوة!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("فشل النسخ");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join hnChat — The World's First Super App",
          text: "Try hnChat: AI chat, social, crypto & more in one app!",
          url: referralLink,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  const rewards = [
    { count: 5, reward: "شارة مُحيل VIP", rewardEn: "VIP Referrer Badge", unlocked: referralCount >= 5 },
    { count: 10, reward: "ثيم حصري", rewardEn: "Exclusive Theme", unlocked: referralCount >= 10 },
    { count: 25, reward: "ميزات AI متقدمة", rewardEn: "Advanced AI Features", unlocked: referralCount >= 25 },
    { count: 50, reward: "عضوية ذهبية", rewardEn: "Gold Membership", unlocked: referralCount >= 50 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-ice-border/10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <HnLogo className="h-5 w-5" />
            <span className="text-sm font-bold">hnChat</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm text-muted-foreground">نظام الإحالة</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 border border-cyan-glow/30 mb-4">
            <Gift className="w-8 h-8 text-cyan-glow" />
          </div>
          <h1 className="text-3xl font-extrabold">
            ادعُ أصدقائك & <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">اكسب مكافآت</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            شارك رابط الدعوة الخاص بك مع أصدقائك واحصل على مكافآت حصرية عن كل مستخدم ينضم عبر رابطك
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: "إحالات ناجحة", value: referralCount },
            { icon: TrendingUp, label: "المستوى", value: referralCount >= 50 ? "ذهبي" : referralCount >= 25 ? "فضي" : referralCount >= 10 ? "برونزي" : "مبتدئ" },
            { icon: Gift, label: "مكافآت مفتوحة", value: rewards.filter(r => r.unlocked).length },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-ice-border/10 bg-ice-card/30 p-4 text-center"
            >
              <stat.icon className="w-5 h-5 mx-auto mb-2 text-cyan-glow" />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground/60 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Referral Link Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-cyan-glow/20 bg-gradient-to-br from-cyan-glow/5 to-violet-glow/5 p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-4 h-4 text-cyan-glow" />
            <span className="text-sm font-semibold">رابط الدعوة الخاص بك</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg bg-background/60 border border-ice-border/20 px-4 py-2.5 text-xs text-muted-foreground font-mono truncate" dir="ltr">
              {referralLink}
            </div>
            <button
              onClick={copyLink}
              className="px-4 py-2.5 rounded-lg bg-cyan-glow/10 border border-cyan-glow/30 text-cyan-glow text-xs font-semibold hover:bg-cyan-glow/20 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "تم!" : "نسخ"}
            </button>
            <button
              onClick={shareLink}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-glow to-violet-glow text-white text-xs font-semibold hover:shadow-lg hover:shadow-cyan-glow/20 transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              مشاركة
            </button>
          </div>
        </motion.div>

        {/* Rewards Ladder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold mb-4">🎁 سلم المكافآت</h2>
          <div className="space-y-3">
            {rewards.map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                  r.unlocked
                    ? "border-cyan-glow/30 bg-cyan-glow/5"
                    : "border-ice-border/10 bg-ice-card/20 opacity-60"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  r.unlocked
                    ? "bg-gradient-to-br from-cyan-glow to-violet-glow text-white"
                    : "bg-ice-card/50 text-muted-foreground/50"
                }`}>
                  {r.count}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{r.reward}</div>
                  <div className="text-[10px] text-muted-foreground/50">{r.rewardEn}</div>
                </div>
                {r.unlocked && (
                  <span className="text-[10px] font-bold text-cyan-glow px-2 py-0.5 rounded-full border border-cyan-glow/30">
                    ✓ مفتوح
                  </span>
                )}
                {!r.unlocked && (
                  <span className="text-[10px] text-muted-foreground/40">
                    {r.count - referralCount} متبقي
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
