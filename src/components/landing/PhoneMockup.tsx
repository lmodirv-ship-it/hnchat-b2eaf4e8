import { HnLogo } from "@/components/HnLogo";
import { Bot, MessageCircle, ShoppingBag, TrendingUp, Mic, Video } from "lucide-react";

export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[220px]" style={{ perspective: "800px" }}>
      {/* Glow behind phone */}
      <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-cyan-glow/30 to-violet-glow/20 blur-3xl" />

      {/* Phone frame */}
      <div
        className="relative rounded-[2rem] border-2 border-ice-border/50 bg-background/90 backdrop-blur-xl p-2 shadow-diamond"
        style={{ transform: "rotateY(-8deg) rotateX(3deg)" }}
      >
        {/* Screen */}
        <div className="rounded-[1.5rem] bg-gradient-to-b from-background via-background to-ice-card/40 overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 pt-2 pb-1">
            <span className="text-[9px] text-muted-foreground/50">9:41</span>
            <div className="w-16 h-4 rounded-full bg-foreground/10" />
            <div className="flex gap-0.5">
              <div className="w-3 h-1.5 rounded-sm bg-muted-foreground/30" />
              <div className="w-1.5 h-1.5 rounded-sm bg-muted-foreground/30" />
            </div>
          </div>

          {/* App header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-ice-border/20">
            <HnLogo className="h-5 w-5" />
            <span className="text-[10px] font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">hnChat</span>
          </div>

          {/* Mini feed */}
          <div className="p-2 space-y-1.5">
            {[
              { icon: Bot, label: "AI Hub", c: "text-cyan-glow bg-cyan-glow/10" },
              { icon: ShoppingBag, label: "hnShop", c: "text-pink-glow bg-pink-glow/10" },
              { icon: TrendingUp, label: "Crypto", c: "text-emerald-400 bg-emerald-400/10" },
              { icon: MessageCircle, label: "Messages", c: "text-violet-glow bg-violet-glow/10" },
              { icon: Mic, label: "Voice", c: "text-amber-400 bg-amber-400/10" },
              { icon: Video, label: "Reels", c: "text-rose-400 bg-rose-400/10" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2 rounded-lg bg-ice-card/20 px-2 py-1.5">
                  <div className={`p-1 rounded-md ${item.c}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="text-[9px] font-medium text-foreground/70">{item.label}</span>
                  <div className="flex-1" />
                  <div className="w-8 h-1 rounded-full bg-ice-border/30" />
                </div>
              );
            })}
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-around px-2 py-2 border-t border-ice-border/20">
            {[MessageCircle, Bot, ShoppingBag, Mic].map((Icon, i) => (
              <div key={i} className={`p-1 rounded-md ${i === 0 ? "text-cyan-glow" : "text-muted-foreground/40"}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
