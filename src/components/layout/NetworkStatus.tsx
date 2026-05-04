import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { isNative } from "@/lib/native-bridge";

/**
 * Enhanced network status that works on both web and native.
 * Shows a toast-like banner when connectivity changes.
 */
export function NetworkStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    const up = () => {
      setOnline(true);
      setShowReconnected(true);
      reconnectTimer = setTimeout(() => setShowReconnected(false), 3000);
    };
    const down = () => {
      setOnline(false);
      setShowReconnected(false);
    };
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
      clearTimeout(reconnectTimer);
    };
  }, []);

  if (online && !showReconnected) return null;

  return (
    <div
      role="status"
      className={`fixed top-0 inset-x-0 z-[60] text-xs font-medium py-1.5 px-3 flex items-center justify-center gap-2 backdrop-blur transition-colors duration-300 ${
        online
          ? "bg-emerald-500/90 text-white"
          : "bg-destructive/90 text-destructive-foreground"
      }`}
      style={{ paddingTop: `calc(env(safe-area-inset-top) + 0.375rem)` }}
    >
      {online ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span>تم استعادة الاتصال</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>لا يوجد اتصال بالإنترنت</span>
        </>
      )}
    </div>
  );
}
