import { useEffect } from "react";
import { isNative, getPlatform } from "@/lib/native-bridge";

/**
 * Manages the native status bar appearance.
 * On web/PWA, this renders nothing. On native, adjusts status bar styling.
 */
export function NativeStatusBar() {
  useEffect(() => {
    if (!isNative()) return;

    // Add padding-top for the native status bar
    const platform = getPlatform();
    if (platform === "android") {
      document.documentElement.style.setProperty("--native-status-bar-height", "24px");
    } else if (platform === "ios") {
      document.documentElement.style.setProperty("--native-status-bar-height", "44px");
    }

    // Set meta theme-color to match our dark background
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#0a0815");
  }, []);

  return null;
}
