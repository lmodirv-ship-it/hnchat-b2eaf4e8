import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function LiveTimestamp() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-[10px] text-[oklch(0.55_0.12_220)] tracking-wider tabular-nums">
      {now.toLocaleTimeString("en-US", { hour12: false })}
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 ml-2 animate-status-glow" style={{ color: "oklch(0.7 0.2 160)" }} />
    </span>
  );
}

export function OwnerShell({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-8 relative">
      {/* Ambient living background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[oklch(0.78_0.18_220/0.04)] blur-[100px] animate-neural" />
        <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-[oklch(0.65_0.25_295/0.03)] blur-[120px] animate-neural" style={{ animationDelay: "1.5s" }} />
      </div>

      <header className="flex items-start justify-between mb-10 pb-6 border-b border-[oklch(1_0_0/0.06)] relative">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-[oklch(0.78_0.18_220)] animate-status-glow" style={{ color: "oklch(0.78 0.18 220)" }} />
            <span className="text-[9px] uppercase tracking-[0.4em] text-[oklch(0.5_0.12_220)] font-semibold">SYSTEM ACTIVE</span>
            <LiveTimestamp />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[oklch(0.95_0.02_220)] via-[oklch(0.85_0.15_220)] to-[oklch(0.75_0.2_295)] bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && <p className="text-sm text-[oklch(0.55_0.03_250)] mt-2 max-w-lg">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

export function OwnerCard({ children, className = "", glow }: { children: ReactNode; className?: string; glow?: "cyan" | "violet" | "emerald" }) {
  const glowMap = {
    cyan: "hover:shadow-[0_0_40px_oklch(0.78_0.18_220/0.12)]",
    violet: "hover:shadow-[0_0_40px_oklch(0.65_0.25_295/0.12)]",
    emerald: "hover:shadow-[0_0_40px_oklch(0.7_0.2_160/0.12)]",
  };
  return (
    <div className={`
      bg-[oklch(0.06_0.015_260/0.8)] 
      border border-[oklch(1_0_0/0.06)] 
      rounded-2xl 
      backdrop-blur-xl 
      transition-all duration-500 ease-out
      hover:border-[oklch(1_0_0/0.12)]
      ${glow ? glowMap[glow] : "hover:shadow-[0_0_30px_oklch(0.78_0.18_220/0.08)]"}
      ${className}
    `}>
      {children}
    </div>
  );
}

export function OwnerStat({ label, value, hint, icon: Icon, accent = "amber", trend }: {
  label: string; value: ReactNode; hint?: string; icon?: any; accent?: "amber" | "rose" | "cyan"; trend?: number;
}) {
  const accents = {
    amber: { bg: "from-[oklch(0.8_0.16_80)] to-[oklch(0.65_0.2_60)]", text: "text-[oklch(0.85_0.12_80)]", glow: "oklch(0.8 0.16 80 / 0.15)" },
    rose: { bg: "from-[oklch(0.7_0.22_15)] to-[oklch(0.55_0.25_350)]", text: "text-[oklch(0.8_0.18_15)]", glow: "oklch(0.7 0.22 15 / 0.15)" },
    cyan: { bg: "from-[oklch(0.78_0.18_220)] to-[oklch(0.65_0.25_295)]", text: "text-[oklch(0.82_0.14_220)]", glow: "oklch(0.78 0.18 220 / 0.15)" },
  };
  const a = accents[accent];
  return (
    <div className="group relative p-4 rounded-2xl bg-[oklch(0.06_0.015_260/0.6)] border border-[oklch(1_0_0/0.05)] hover:border-[oklch(1_0_0/0.12)] transition-all duration-500 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: a.glow }} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-[0.15em] text-[oklch(0.5_0.03_250)] mb-1.5">{label}</div>
          <div className="text-2xl font-bold text-[oklch(0.95_0.02_250)] tabular-nums">{value}</div>
          {trend !== undefined && (
            <div className={`text-[10px] mt-1 font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </div>
          )}
          {hint && <div className="text-[10px] text-[oklch(0.45_0.03_250)] mt-1">{hint}</div>}
        </div>
        {Icon && (
          <div className={`p-2 rounded-xl bg-gradient-to-br ${a.bg} opacity-80 group-hover:opacity-100 transition-opacity`}>
            <Icon className="h-4 w-4 text-[oklch(0.04_0.01_280)]" />
          </div>
        )}
      </div>
    </div>
  );
}
