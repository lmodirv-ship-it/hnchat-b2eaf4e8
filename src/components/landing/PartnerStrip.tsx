import { motion } from "framer-motion";
import { Bot, ShoppingBag, TrendingUp, Film, Mic, Gamepad2, Globe, Sparkles } from "lucide-react";

const items = [
  { icon: Bot, label: "AI Hub", color: "text-cyan-glow" },
  { icon: ShoppingBag, label: "hnShop", color: "text-pink-glow" },
  { icon: TrendingUp, label: "Crypto", color: "text-emerald-400" },
  { icon: Film, label: "Reels", color: "text-violet-glow" },
  { icon: Mic, label: "Voice", color: "text-amber-400" },
  { icon: Gamepad2, label: "Games", color: "text-rose-400" },
  { icon: Globe, label: "Explore", color: "text-blue-400" },
  { icon: Sparkles, label: "Stories", color: "text-yellow-400" },
];

// Double the items for seamless loop
const loopItems = [...items, ...items];

export function PartnerStrip() {
  return (
    <section className="relative z-10 py-10 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 mb-6">
        <p className="text-center text-sm text-muted-foreground/60 uppercase tracking-widest">Powered by</p>
      </div>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        {/* Scrolling strip */}
        <motion.div
          className="flex gap-12 items-center whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {loopItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={`${item.label}-${i}`} className="flex items-center gap-2.5 shrink-0">
                <div className={`p-2.5 rounded-xl bg-ice-card/30 backdrop-blur-xl border border-ice-border/30 ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{item.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
