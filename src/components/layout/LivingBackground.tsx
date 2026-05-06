import { useEnergy, MODE_CONFIG } from "@/hooks/useEnergySystem";

export function LivingBackground() {
  const { mode } = useEnergy();
  const cfg = MODE_CONFIG[mode];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Animated cosmic orbs */}
      <div
        className="absolute h-[600px] w-[600px] rounded-full blur-[180px]"
        style={{
          top: "-15%",
          left: "5%",
          background: `radial-gradient(circle, ${cfg.orb1.replace(/[\d.]+\)$/, "0.22)")} 0%, transparent 70%)`,
          animation: "cosmicFloat1 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute h-[500px] w-[500px] rounded-full blur-[160px]"
        style={{
          top: "30%",
          right: "-10%",
          background: `radial-gradient(circle, ${cfg.orb2.replace(/[\d.]+\)$/, "0.18)")} 0%, transparent 70%)`,
          animation: "cosmicFloat2 30s ease-in-out infinite",
        }}
      />
      <div
        className="absolute h-[450px] w-[450px] rounded-full blur-[150px]"
        style={{
          bottom: "-10%",
          left: "25%",
          background: "radial-gradient(circle, oklch(0.55 0.22 280 / 0.14) 0%, transparent 70%)",
          animation: "cosmicFloat3 20s ease-in-out infinite",
        }}
      />
      {/* Deep navy center glow */}
      <div
        className="absolute h-[700px] w-[700px] rounded-full blur-[200px]"
        style={{
          top: "20%",
          left: "30%",
          background: "radial-gradient(circle, oklch(0.25 0.08 260 / 0.3) 0%, transparent 60%)",
          animation: "cosmicFloat4 35s ease-in-out infinite",
        }}
      />

      {/* Soft particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${8 + ((i * 17) % 84)}%`,
            top: `${5 + ((i * 23) % 85)}%`,
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            background: i % 3 === 0
              ? "oklch(0.78 0.18 220 / 0.35)"
              : i % 3 === 1
                ? "oklch(0.65 0.25 295 / 0.25)"
                : "oklch(0.72 0.20 260 / 0.20)",
            animation: `particleDrift${(i % 4) + 1} ${12 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="neural-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="oklch(0.78 0.18 220)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural-grid)" />
      </svg>

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, oklch(0.20 0.04 265 / 0.5) 100%)",
        }}
      />
    </div>
  );
}
