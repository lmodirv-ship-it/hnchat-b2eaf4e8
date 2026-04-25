import type { ReactNode } from "react";

export function OwnerShell({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode;
}) {
  return (
    <div className="container max-w-7xl mx-auto px-6 py-8">
      <header className="flex items-start justify-between mb-8 pb-5 border-b border-[oklch(0.18_0.04_30)]">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[oklch(0.55_0.1_50)] mb-1.5">Owner</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[oklch(0.92_0.1_50)] via-[oklch(0.85_0.15_50)] to-[oklch(0.7_0.18_25)] bg-clip-text text-transparent">{title}</h1>
          {subtitle && <p className="text-sm text-[oklch(0.6_0.04_40)] mt-1.5">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

export function OwnerCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[oklch(0.07_0.02_30)] border border-[oklch(0.18_0.04_30)] rounded-xl backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

export function OwnerStat({ label, value, hint, icon: Icon, accent = "amber" }: {
  label: string; value: ReactNode; hint?: string; icon?: any; accent?: "amber" | "rose" | "cyan";
}) {
  const accents = {
    amber: "from-[oklch(0.75_0.18_50)] to-[oklch(0.6_0.2_40)]",
    rose: "from-[oklch(0.7_0.22_15)] to-[oklch(0.55_0.25_25)]",
    cyan: "from-cyan-glow to-violet-glow",
  };
  return (
    <OwnerCard className="p-5 relative overflow-hidden">
      <div className={`absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${accents[accent]} opacity-15 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[oklch(0.55_0.04_40)]">{label}</div>
          <div className="text-3xl font-bold mt-2 text-[oklch(0.95_0.05_50)]">{value}</div>
          {hint && <div className="text-xs text-[oklch(0.5_0.04_40)] mt-1">{hint}</div>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg bg-gradient-to-br ${accents[accent]}`}>
            <Icon className="h-5 w-5 text-[oklch(0.04_0.01_280)]" />
          </div>
        )}
      </div>
    </OwnerCard>
  );
}
