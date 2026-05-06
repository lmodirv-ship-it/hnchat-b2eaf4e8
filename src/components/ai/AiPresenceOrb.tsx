import { useEnergy } from "@/hooks/useEnergySystem";
import { Brain, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const AI_TIPS = [
  "يمكنني مساعدتك في تنظيم محادثاتك",
  "جرّب وضع Deep AI للتحليل العميق",
  "اكتشف Reels الجديدة المقترحة لك",
  "لديك 3 رسائل مهمة تنتظر الرد",
  "وضع Creative يفتح أدوات تصميم إضافية",
  "نشاطك زاد 23% هذا الأسبوع",
];

export function AiPresenceOrb() {
  const { mode, intensity } = useEnergy();
  const [tipIndex, setTipIndex] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % AI_TIPS.length);
      setShowTip(true);
      const hideTimer = window.setTimeout(() => setShowTip(false), 4000);
      return () => window.clearTimeout(hideTimer);
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const color = mode === "deep-ai" ? "oklch(0.65 0.25 295)"
    : mode === "creative" ? "oklch(0.72 0.22 340)"
    : mode === "social" ? "oklch(0.7 0.2 160)"
    : "oklch(0.78 0.18 220)";

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Floating tip */}
      {(showTip || hovered) && (
        <div className="max-w-[220px] px-3 py-2 rounded-xl bg-[oklch(0.06_0.02_260/0.95)] backdrop-blur-2xl border border-[oklch(1_0_0/0.08)] shadow-[0_8px_30px_oklch(0_0_0/0.4)] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3 w-3" style={{ color }} />
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color }}>AI Insight</span>
          </div>
          <p className="text-[11px] text-[oklch(0.75_0.03_250)] leading-relaxed">{AI_TIPS[tipIndex]}</p>
        </div>
      )}

      {/* AI Orb */}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setShowTip(!showTip)}
        className="relative h-11 w-11 rounded-full flex items-center justify-center transition-all duration-500 group"
        style={{
          background: `radial-gradient(circle, ${color}30, ${color}10)`,
          boxShadow: hovered ? `0 0 30px ${color}40, 0 0 60px ${color}15` : `0 0 15px ${color}20`,
          border: `1px solid ${color}30`,
        }}
      >
        <Brain className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" style={{ color }} />
        {/* Breathing ring */}
        <div
          className="absolute inset-0 rounded-full animate-breathe opacity-40"
          style={{ border: `1px solid ${color}` }}
        />
        {/* Activity indicator */}
        <div
          className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full animate-status-glow"
          style={{ background: "oklch(0.7 0.2 160)", color: "oklch(0.7 0.2 160)" }}
        />
      </button>
    </div>
  );
}
