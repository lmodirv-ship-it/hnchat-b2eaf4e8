import { useEnergy, MODE_CONFIG } from "@/hooks/useEnergySystem";
import { useMemo } from "react";

export function LivingBackground() {
  const { mode, intensity } = useEnergy();
  const cfg = MODE_CONFIG[mode];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Single large ambient orb — CSS only, no JS animation */}
      <div
        className="absolute top-[-10%] left-[10%] h-[500px] w-[500px] rounded-full blur-[160px]"
        style={{
          background: `radial-gradient(circle, ${cfg.orb1.replace(/[\d.]+\)$/, "0.18)")} 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-[-5%] right-[15%] h-[400px] w-[400px] rounded-full blur-[140px]"
        style={{
          background: `radial-gradient(circle, ${cfg.orb2.replace(/[\d.]+\)$/, "0.14)")} 0%, transparent 70%)`,
        }}
      />
      {/* Center glow */}
      <div
        className="absolute top-[35%] left-[45%] h-[500px] w-[500px] rounded-full blur-[180px]"
        style={{
          background: "radial-gradient(circle, oklch(0.55 0.2 270 / 0.06) 0%, transparent 60%)",
        }}
      />

      {/* Subtle grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="neural-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="oklch(0.78 0.18 220)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural-grid)" />
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, oklch(0.28 0.05 265 / 0.3) 100%)",
        }}
      />
    </div>
  );
}