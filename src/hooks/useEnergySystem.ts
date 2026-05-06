import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export type EnergyMode = "focus" | "creative" | "social" | "deep-ai";

interface EnergyState {
  mode: EnergyMode;
  setMode: (mode: EnergyMode) => void;
  intensity: number; // 0-1 based on activity
  activityPulse: () => void;
}

const MODE_CONFIG = {
  focus: {
    label: "Focus",
    labelAr: "تركيز",
    hue: 220,
    saturation: 0.18,
    glowOpacity: 0.06,
    animSpeed: 1.5,
    bgOrbs: ["oklch(0.78 0.18 220 / var(--energy-glow))", "oklch(0.6 0.12 240 / calc(var(--energy-glow) * 0.5))"],
  },
  creative: {
    label: "Creative",
    labelAr: "إبداع",
    hue: 320,
    saturation: 0.22,
    glowOpacity: 0.1,
    animSpeed: 1,
    bgOrbs: ["oklch(0.72 0.22 340 / var(--energy-glow))", "oklch(0.65 0.25 295 / var(--energy-glow))"],
  },
  social: {
    label: "Social",
    labelAr: "تواصل",
    hue: 160,
    saturation: 0.2,
    glowOpacity: 0.08,
    animSpeed: 0.8,
    bgOrbs: ["oklch(0.7 0.2 160 / var(--energy-glow))", "oklch(0.78 0.18 180 / calc(var(--energy-glow) * 0.7))"],
  },
  "deep-ai": {
    label: "Deep AI",
    labelAr: "ذكاء عميق",
    hue: 280,
    saturation: 0.25,
    glowOpacity: 0.12,
    animSpeed: 2,
    bgOrbs: ["oklch(0.65 0.25 295 / var(--energy-glow))", "oklch(0.55 0.3 270 / var(--energy-glow))"],
  },
} as const;

export { MODE_CONFIG };

const EnergyContext = createContext<EnergyState>({
  mode: "focus",
  setMode: () => {},
  intensity: 0.3,
  activityPulse: () => {},
});

export const useEnergy = () => useContext(EnergyContext);

export function useEnergyProvider(): EnergyState {
  const [mode, setMode] = useState<EnergyMode>(() => {
    if (typeof window === "undefined") return "focus";
    return (localStorage.getItem("hn-energy-mode") as EnergyMode) ?? "focus";
  });
  const [intensity, setIntensity] = useState(0.3);
  const decayRef = useRef<ReturnType<typeof setInterval>>();

  const persistMode = useCallback((m: EnergyMode) => {
    setMode(m);
    localStorage.setItem("hn-energy-mode", m);
  }, []);

  const activityPulse = useCallback(() => {
    setIntensity((prev) => Math.min(1, prev + 0.15));
  }, []);

  // Decay intensity over time
  useEffect(() => {
    decayRef.current = setInterval((() => {
      setIntensity((prev) => Math.max(0.15, prev - 0.02));
    }, 2000);
    return () => clearInterval(decayRef.current);
  }, []);

  // Set CSS custom properties on root
  useEffect(() => {
    const cfg = MODE_CONFIG[mode];
    const root = document.documentElement;
    root.style.setProperty("--energy-hue", String(cfg.hue));
    root.style.setProperty("--energy-glow", String(cfg.glowOpacity * (0.5 + intensity * 0.5)));
    root.style.setProperty("--energy-speed", `${cfg.animSpeed}s`);
  }, [mode, intensity]);

  return { mode, setMode: persistMode, intensity, activityPulse };
}

export { EnergyContext };
