import { Link, useLocation } from "@tanstack/react-router";
import { Home, Film, PlusSquare, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtime } from "@/components/providers/RealtimeProvider";

const items = [
  { to: "/feed", label: "الرئيسية", icon: Home },
  { to: "/reels", label: "Reels", icon: Film },
  { to: "/feed", label: "نشر", icon: PlusSquare, primary: true, query: { compose: "1" } },
  { to: "/messages", label: "رسائل", icon: MessageCircle },
  { to: "/profile", label: "حسابي", icon: User },
] as const;

// Light haptic via Web Vibration API (works on Android browsers & Capacitor WebView)
const tap = () => {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(8);
    }
  } catch {}
};

export function MobileBottomNav() {
  const loc = useLocation();
  const { msgUnread } = useRealtime();

  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-ice-border/30 bg-background/60 backdrop-blur-3xl backdrop-saturate-[1.8] shadow-[0_-8px_40px_oklch(0_0_0/0.5)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Top decorative gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/60 to-transparent" />

      <ul className="grid grid-cols-5 items-end h-[68px]">
        {items.map((it, idx) => {
          const Icon = it.icon;
          const active = loc.pathname === it.to && !("primary" in it && it.primary);
          const badgeCount = it.to === "/messages" ? msgUnread : 0;

          if ("primary" in it && it.primary) {
            return (
              <li key={idx} className="flex justify-center -mt-7">
                <Link
                  to={it.to}
                  search={it.query as any}
                  onClick={tap}
                  className="group relative h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-glow via-primary to-violet-glow text-white shadow-[0_8px_28px_oklch(0.65_0.18_280/0.55)] flex items-center justify-center active:scale-90 transition-all duration-200 ring-4 ring-background/90 overflow-hidden"
                  aria-label={it.label}
                >
                  {/* Glossy highlight */}
                  <span className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent opacity-60 pointer-events-none" />
                  {/* Animated glow ring */}
                  <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-glow to-violet-glow opacity-50 blur-md group-active:opacity-80 transition-opacity" />
                  <Icon className="relative h-6 w-6" strokeWidth={2.4} />
                </Link>
              </li>
            );
          }
          return (
            <li key={idx} className="flex">
              <Link
                to={it.to}
                onClick={tap}
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center gap-1 py-1.5 text-[10px] font-semibold transition-all duration-300",
                  active
                    ? "text-cyan-glow"
                    : "text-muted-foreground/70 active:text-foreground active:scale-95",
                )}
                aria-label={it.label}
              >
                {/* Animated active pill background */}
                {active && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 h-9 w-12 rounded-2xl bg-gradient-to-br from-cyan-glow/20 to-violet-glow/15 border border-cyan-glow/30 shadow-[0_0_16px_oklch(0.70_0.12_220/0.35)] animate-scale-in" />
                )}
                <div className="relative p-1">
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-all duration-300",
                      active && "drop-shadow-[0_0_10px_currentColor] scale-110"
                    )}
                    strokeWidth={active ? 2.5 : 1.9}
                  />
                  {badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-pink-glow to-destructive text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_10px_oklch(0.72_0.22_340/0.6)] ring-2 ring-background animate-fade-in">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </div>
                <span className={cn("relative leading-none transition-all", active && "font-bold")}>
                  {it.label}
                </span>
                {/* Active dot indicator */}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow shadow-[0_0_8px_currentColor]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
