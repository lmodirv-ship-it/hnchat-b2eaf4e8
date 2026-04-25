/**
 * Lightweight haptic feedback. Uses Web Vibration API where supported.
 * No-op on platforms without vibration (most desktops, iOS Safari).
 * If running inside Capacitor, native Haptics plugin overrides this at runtime.
 */
export function haptic(kind: "light" | "medium" | "success" | "error" = "light") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 25,
    success: [15, 40, 15],
    error: [40, 30, 40],
  };
  try {
    navigator.vibrate(patterns[kind]);
  } catch {
    // ignore
  }
}
