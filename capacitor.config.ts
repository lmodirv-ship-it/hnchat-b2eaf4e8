import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hnchat.app",
  appName: "hnChat",
  webDir: "dist",
  backgroundColor: "#0a0815",

  // For dev, uncomment to live-reload against the published site:
  // server: {
  //   url: "https://www.hn-chat.com",
  //   cleartext: false,
  // },

  android: {
    allowMixedContent: false,
    // Deep links / App Links
    appendUrlToPath: false,
  },
  ios: {
    contentInset: "always",
    // Universal Links
    scheme: "hnchat",
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
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#00E5FF",
    },
    Camera: {
      presentationStyle: "fullscreen",
    },
    Haptics: {},
    Share: {},
    Browser: {},
    App: {},
    Network: {},
    Device: {},
    Clipboard: {},
    ScreenOrientation: {},
  },

  // Associate your custom domain for deep links
  server: {
    hostname: "www.hn-chat.com",
    androidScheme: "https",
    iosScheme: "https",
  },
};

export default config;
