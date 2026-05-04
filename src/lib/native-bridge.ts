/**
 * Native Bridge — Detects Capacitor / PWA / Web and provides
 * platform-aware utilities for the mobile app.
 */

/** Check if running inside a Capacitor native shell */
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

/** Check if running as an installed PWA */
export function isPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

/** Get the current platform */
export function getPlatform(): "android" | "ios" | "web" {
  if (!isNative()) return "web";
  const cap = (window as any).Capacitor;
  return cap?.getPlatform?.() ?? "web";
}

/** Safe-area insets for notched devices */
export function getSafeAreaInsets() {
  if (typeof window === "undefined") return { top: 0, bottom: 0, left: 0, right: 0 };
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue("env(safe-area-inset-top)") || "0", 10),
    bottom: parseInt(style.getPropertyValue("env(safe-area-inset-bottom)") || "0", 10),
    left: parseInt(style.getPropertyValue("env(safe-area-inset-left)") || "0", 10),
    right: parseInt(style.getPropertyValue("env(safe-area-inset-right)") || "0", 10),
  };
}

/** Native share via Web Share API or Capacitor Share plugin */
export async function nativeShare(data: { title?: string; text?: string; url?: string }) {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    }
  } catch {
    // User cancelled or not supported
  }
  // Fallback: copy to clipboard
  if (data.url && navigator.clipboard) {
    await navigator.clipboard.writeText(data.url);
    return true;
  }
  return false;
}

/** Handle Android back button — returns true if handled */
let backHandlers: (() => boolean)[] = [];

export function registerBackHandler(handler: () => boolean) {
  backHandlers.push(handler);
  return () => {
    backHandlers = backHandlers.filter((h) => h !== handler);
  };
}

/** Initialize native-only listeners (call once in root) */
export function initNativeBridge() {
  if (typeof window === "undefined") return;

  // Android hardware back button
  if (isNative()) {
    document.addEventListener("backbutton", (e) => {
      for (let i = backHandlers.length - 1; i >= 0; i--) {
        if (backHandlers[i]()) {
          e.preventDefault();
          return;
        }
      }
      // Default: go back in history
      if (window.history.length > 1) {
        window.history.back();
      }
    });
  }

  // Prevent pull-to-refresh on mobile web when inside app
  if (isPWA() || isNative()) {
    document.body.style.overscrollBehavior = "none";
  }

  // Disable context menu on long press for native feel
  if (isNative()) {
    document.addEventListener("contextmenu", (e) => {
      const target = e.target as HTMLElement;
      // Allow context menu on inputs and textareas
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      e.preventDefault();
    });
  }
}
