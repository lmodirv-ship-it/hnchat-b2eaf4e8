import { useEnergy, MODE_CONFIG, type EnergyMode } from "@/hooks/useEnergySystem";
import { Brain, Palette, Users, Cpu, ChevronUp } from "lucide-react";
import { useState } from "react";

const MODE_ICONS: Record<EnergyMode, any> = {
  focus: Brain,
  creative: Palette,
  social: Users,
  "deep-ai": Cpu,
};

const MODE_COLORS: Record<EnergyMode, string> = {
  focus: "oklch(0.78 0.18 220)",
  creative: "oklch(0.72 0.22 340)",
  social: "oklch(0.7 0.2 160)",
  "deep-ai": "oklch(0.65 0.25 295)",
};

export function EnergyModeSelector() {
  const { mode, setMode, intensity } = useEnergy();
  const [open, setOpen] = useState(false);
  const cfg = MODE_CONFIG[mode];
  const Icon = MODE_ICONS[mode];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[oklch(1_0_0/0.08)] bg-[oklch(0.06_0.015_260/0.6)] backdrop-blur-xl hover:border-[oklch(1_0_0/0.15)] transition-all duration-300 group"
      >
        <div className="relative">
          <Icon className="h-3.5 w-3.5" style={{ color: MODE_COLORS[mode] }} />
          {/* Breathing dot */}
          <div
            className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full animate-breathe"
            style={{ background: MODE_COLORS[mode], boxShadow: `0 0 6px ${MODE_COLORS[mode]}` }}
          />
        </div>
        <span className="text-[10px] font-medium text-[oklch(0.7_0.03_250)]">{cfg.label}</span>
        <ChevronUp className={`h-3 w-3 text-[oklch(0.5_0.03_250)] transition-transform ${open ? "" : "rotate-180"}`} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-48 rounded-xl border border-[oklch(1_0_0/0.08)] bg-[oklch(0.06_0.02_260/0.95)] backdrop-blur-2xl shadow-[0_8px_40px_oklch(0_0_0/0.5)] p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {(Object.keys(MODE_CONFIG) as EnergyMode[]).map((m) => {
            const MIcon = MODE_ICONS[m];
            const active = m === mode;
            const c = MODE_CONFIG[m];
            return (
              <button
                key={m}
                onClick={() => { setMode(m); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                  active
                    ? "bg-[oklch(1_0_0/0.06)]"
                    : "hover:bg-[oklch(1_0_0/0.04)]"
                }`}
              >
                <MIcon className="h-4 w-4" style={{ color: MODE_COLORS[m] }} />
                <div className="text-left">
                  <div className="font-medium text-[oklch(0.85_0.03_250)]">{c.label}</div>
                  <div className="text-[9px] text-[oklch(0.5_0.03_250)]">{c.labelAr}</div>
                </div>
                {active && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: MODE_COLORS[m] }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
