import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";

export type EnergyMode = "focus" | "creative" | "social" | "deep-ai";

interface EnergyState {
  mode: EnergyMode;
  setMode: (mode: EnergyMode) => void;
  intensity: number;
  activityPulse: () => void;
}

const MODE_CONFIG = {
  focus: {
    label: "Focus", labelAr: "تركيز", hue: 220, saturation: 0.18,
    glowOpacity: 0.06, animSpeed: 1.5,
    orb1: "oklch(0.78 0.18 220 / 0.06)", orb2: "oklch(0.6 0.12 240 / 0.03)",
  },
  creative: {
    label: "Creative", labelAr: "إبداع", hue: 320, saturation: 0.22,
    glowOpacity: 0.1, animSpeed: 1,
    orb1: "oklch(0.72 0.22 340 / 0.08)", orb2: "oklch(0.65 0.25 295 / 0.06)",
  },
  social: {
    label: "Social", labelAr: "تواصل", hue: 160, saturation: 0.2,
    glowOpacity: 0.08, animSpeed: 0.8,
    orb1: "oklch(0.7 0.2 160 / 0.07)", orb2: "oklch(0.78 0.18 180 / 0.05)",
  },
  "deep-ai": {
    label: "Deep AI", labelAr: "ذكاء عميق", hue: 280, saturation: 0.25,
    glowOpacity: 0.12, animSpeed: 2,
    orb1: "oklch(0.65 0.25 295 / 0.1)", orb2: "oklch(0.55 0.3 270 / 0.07)",
  },
} as const;

export { MODE_CONFIG };

const defaultState: EnergyState = {
  mode: "focus",
  setMode: () => {},
  intensity: 0.3,
  activityPulse: () => {},
};

const EnergyContext = createContext<EnergyState>(defaultState);

export const useEnergy = () => useContext(EnergyContext);

export function EnergyProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<EnergyMode>(() => {
    if (typeof window === "undefined") return "focus";
    return (localStorage.getItem("hn-energy-mode") as EnergyMode) ?? "focus";
  });
  const [intensity, setIntensity] = useState(0.3);
  const timerRef = useRef<number | null>(null);

  const setMode = useCallback((m: EnergyMode) => {
    setModeState(m);
    localStorage.setItem("hn-energy-mode", m);
  }, []);

  const activityPulse = useCallback(() => {
    setIntensity((prev) => Math.min(1, prev + 0.15));
  }, []);

  // Intensity decay
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setIntensity((prev) => Math.max(0.15, prev - 0.02));
    }, 2000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  // CSS custom properties
  useEffect(() => {
    const cfg = MODE_CONFIG[mode];
    const root = document.documentElement;
    root.style.setProperty("--energy-hue", String(cfg.hue));
    root.style.setProperty("--energy-glow", String(cfg.glowOpacity * (0.5 + intensity * 0.5)));
    root.style.setProperty("--energy-speed", `${cfg.animSpeed}s`);
  }, [mode, intensity]);

  return (
    <EnergyContext.Provider value={{ mode, setMode, intensity, activityPulse }}>
      {children}
    </EnergyContext.Provider>
  );
}
