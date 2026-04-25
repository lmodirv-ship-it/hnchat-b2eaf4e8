import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for hnChat mobile (Android / iOS).
 *
 * IMPORTANT:
 * - For development against the live Lovable preview, set server.url below.
 * - For production (APK / TestFlight), comment out server.url so the app
 *   loads the local bundled web assets from `dist/`.
 *
 * Build flow (run locally — Lovable sandbox can't build APKs):
 *   1) bun install
 *   2) bun add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
 *   3) bun run build               # produces dist/
 *   4) npx cap add android         # first time only
 *   5) npx cap add ios             # first time only (macOS)
 *   6) npx cap sync
 *   7) npx cap open android        # opens Android Studio  -> Build APK
 *      npx cap open ios            # opens Xcode (macOS)   -> Archive / TestFlight
 */
const config: CapacitorConfig = {
  appId: "app.lovable.hnchat",
  appName: "hnChat",
  webDir: "dist",
  backgroundColor: "#0a0815",
  // Uncomment for live-reload against the published site during dev:
  // server: {
  //   url: "https://hnchat.lovable.app",
  //   cleartext: false,
  // },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0a0815",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0815",
    },
  },
};

export default config;
