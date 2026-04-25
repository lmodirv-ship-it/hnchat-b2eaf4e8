import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-[60] bg-destructive/90 text-destructive-foreground text-xs font-medium py-1.5 px-3 flex items-center justify-center gap-2 backdrop-blur"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.375rem)" }}
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>لا يوجد اتصال بالإنترنت — بعض الميزات قد لا تعمل</span>
    </div>
  );
}
