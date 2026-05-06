import { useEnergy, MODE_CONFIG } from "@/hooks/useEnergySystem";
import { useMemo } from "react";

export function LivingBackground() {
  const { mode, intensity } = useEnergy();
  const cfg = MODE_CONFIG[mode];

  const style = useMemo(() => ({
    "--orb-speed": `${20 / (0.5 + intensity)}s`,
  } as React.CSSProperties), [intensity]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={style}>
      {/* Primary orb */}
      <div
        className="absolute top-[-10%] left-[10%] h-[500px] w-[500px] rounded-full blur-[120px] transition-all duration-[3s] ease-out"
        style={{
          background: cfg.orb1,
          animation: `meshFloat1 var(--orb-speed, 20s) ease-in-out infinite`,
          opacity: 0.5 + intensity * 0.5,
        }}
      />
      {/* Secondary orb */}
      <div
        className="absolute bottom-[-5%] right-[15%] h-[400px] w-[400px] rounded-full blur-[100px] transition-all duration-[3s] ease-out"
        style={{
          background: cfg.orb2,
          animation: `meshFloat2 var(--orb-speed, 20s) ease-in-out infinite`,
          opacity: 0.4 + intensity * 0.4,
        }}
      />
      {/* Tertiary accent orb — appears at high intensity */}
      <div
        className="absolute top-[40%] left-[60%] h-[300px] w-[300px] rounded-full blur-[140px] transition-all duration-[4s] ease-out"
        style={{
          background: cfg.orb1,
          animation: `meshFloat3 ${25 / (0.5 + intensity)}s ease-in-out infinite`,
          opacity: Math.max(0, (intensity - 0.5) * 0.6),
        }}
      />
      {/* Subtle scan line effect at top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.18_var(--energy-hue,220)/0.15)] to-transparent" />
    </div>
  );
}
