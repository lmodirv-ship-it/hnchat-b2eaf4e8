import { useEffect, useState } from "react";
import { isNative, isPWA, getPlatform, initNativeBridge } from "@/lib/native-bridge";

/**
 * Hook that initializes the native bridge and provides platform info.
 * Call once in the root component.
 */
export function useNativeApp() {
  const [platform, setPlatform] = useState<"android" | "ios" | "web">("web");
  const [native, setNative] = useState(false);
  const [pwa, setPwa] = useState(false);

  useEffect(() => {
    setNative(isNative());
    setPwa(isPWA());
    setPlatform(getPlatform());
    initNativeBridge();

    // Lock orientation to portrait on native
    if (isNative() && screen.orientation?.lock) {
      screen.orientation.lock("portrait").catch(() => {});
    }
  }, []);

  return { platform, isNative: native, isPWA: pwa, isMobileApp: native || pwa };
}
