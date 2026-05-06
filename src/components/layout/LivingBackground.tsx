import { useEnergy, MODE_CONFIG } from "@/hooks/useEnergySystem";
import { useMemo } from "react";

export function LivingBackground() {
  const { mode, intensity } = useEnergy();
  const cfg = MODE_CONFIG[mode];

  const orbSpeed = useMemo(() => `${20 / (0.5 + intensity)}s`, [intensity]);

  // Generate stable particle positions
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      left: `${(i * 17 + 7) % 100}%`,
      delay: `${(i * 2.3) % 12}s`,
      duration: `${12 + (i % 5) * 4}s`,
      size: i % 3 === 0 ? 3 : 2,
      opacity: 0.3 + (i % 4) * 0.1,
    })),
  []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Layer 1: Deep cosmic gradient orbs */}
      <div
        className="absolute top-[-15%] left-[5%] h-[600px] w-[600px] rounded-full blur-[140px] will-change-transform"
        style={{
          background: `radial-gradient(circle, ${cfg.orb1.replace(/[\d.]+\)$/, `${0.15 + intensity * 0.15})`)} 0%, transparent 70%)`,
          animation: `meshFloat1 ${orbSpeed} ease-in-out infinite`,
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[10%] h-[500px] w-[500px] rounded-full blur-[120px] will-change-transform"
        style={{
          background: `radial-gradient(circle, ${cfg.orb2.replace(/[\d.]+\)$/, `${0.12 + intensity * 0.12})`)} 0%, transparent 70%)`,
          animation: `meshFloat2 ${orbSpeed} ease-in-out infinite`,
        }}
      />
      {/* Center deep glow */}
      <div
        className="absolute top-[30%] left-[40%] h-[700px] w-[700px] rounded-full blur-[180px] will-change-transform"
        style={{
          background: `radial-gradient(circle, oklch(0.55 0.2 270 / ${0.04 + intensity * 0.06}) 0%, transparent 60%)`,
          animation: `cosmos-breathe ${18 / (0.5 + intensity)}s ease-in-out infinite`,
        }}
      />
      {/* Accent orb — top right warmth */}
      <div
        className="absolute top-[10%] right-[25%] h-[350px] w-[350px] rounded-full blur-[100px] will-change-transform"
        style={{
          background: `radial-gradient(circle, oklch(0.60 0.15 240 / ${0.06 + intensity * 0.05}) 0%, transparent 65%)`,
          animation: `meshFloat3 ${22 / (0.5 + intensity)}s ease-in-out infinite`,
        }}
      />
      {/* Bottom-left indigo mist */}
      <div
        className="absolute bottom-[15%] left-[20%] h-[400px] w-[400px] rounded-full blur-[130px] will-change-transform"
        style={{
          background: `radial-gradient(circle, oklch(0.50 0.18 285 / ${0.05 + intensity * 0.04}) 0%, transparent 60%)`,
          animation: `cosmos-breathe ${25 / (0.5 + intensity)}s ease-in-out infinite`,
          animationDelay: "-8s",
        }}
      />

      {/* Layer 2: Neural grid lines (very subtle) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="neural-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="oklch(0.78 0.18 220)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural-grid)" />
      </svg>

      {/* Layer 3: Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: i % 2 === 0
              ? `oklch(0.78 0.18 220 / ${p.opacity})`
              : `oklch(0.65 0.25 295 / ${p.opacity})`,
            animation: `particle-float ${p.duration} linear infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Layer 4: Horizontal energy line */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, oklch(0.78 0.18 220 / ${0.12 + intensity * 0.1}), oklch(0.65 0.25 295 / ${0.08 + intensity * 0.06}), transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, oklch(0.65 0.25 295 / ${0.06 + intensity * 0.04}), oklch(0.78 0.18 220 / ${0.08 + intensity * 0.05}), transparent)`,
        }}
      />

      {/* Layer 5: Vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, oklch(0.06 0.03 265 / 0.5) 100%)`,
        }}
      />
    </div>
  );
}
