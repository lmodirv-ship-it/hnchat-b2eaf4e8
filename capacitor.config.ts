import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hnchat.app",
  appName: "hnChat",
  webDir: "dist",

  // Load the published site directly in WebView
  server: {
    url: "https://www.hn-chat.com",
    cleartext: false,
  },

  backgroundColor: "#0a0815",

  android: {
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0a0815",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashImmersive: true,
      splashFullScreen: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0815",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Camera: {
      presentationStyle: "fullscreen",
    },
  },
};

export default config;
