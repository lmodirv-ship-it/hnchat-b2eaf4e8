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

export function MobileBottomNav() {
  const loc = useLocation();
  const { msgUnread, notifUnread } = useRealtime();

  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-ice-border/20 bg-background/70 backdrop-blur-3xl backdrop-saturate-[1.8] shadow-[0_-8px_40px_oklch(0_0_0/0.4)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5 items-end h-16">
        {items.map((it, idx) => {
          const Icon = it.icon;
          const active = loc.pathname === it.to;
          // Live badge count
          const badgeCount = it.to === "/messages" ? msgUnread : 0;

          if ("primary" in it && it.primary) {
            return (
              <li key={idx} className="flex justify-center -mt-6">
                <Link
                  to={it.to}
                  search={it.query as any}
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-glow to-violet-glow text-white shadow-[0_4px_20px_oklch(0.78_0.18_220/0.5)] flex items-center justify-center active:scale-90 transition-all duration-200 ring-4 ring-background/80"
                  aria-label={it.label}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </Link>
              </li>
            );
          }
          return (
            <li key={idx} className="flex">
              <Link
                to={it.to}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium transition-all duration-200",
                  active
                    ? "text-cyan-glow"
                    : "text-muted-foreground/70 active:text-foreground",
                )}
                aria-label={it.label}
              >
                <div className={cn(
                  "relative p-1.5 rounded-xl transition-all duration-200",
                  active && "bg-cyan-glow/10"
                )}>
                  <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_currentColor]")} strokeWidth={active ? 2.5 : 1.8} />
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-cyan-glow" />
                  )}
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-pink-glow text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_oklch(0.72_0.22_340/0.5)]">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </div>
                <span className="leading-none">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
