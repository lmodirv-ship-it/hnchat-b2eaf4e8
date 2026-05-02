import { Link, useLocation } from "@tanstack/react-router";
import { Home, Film, PlusSquare, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/feed", label: "الرئيسية", icon: Home },
  { to: "/reels", label: "Reels", icon: Film },
  { to: "/feed", label: "نشر", icon: PlusSquare, primary: true, query: { compose: "1" } },
  { to: "/messages", label: "رسائل", icon: MessageCircle },
  { to: "/profile", label: "حسابي", icon: User },
] as const;

export function MobileBottomNav() {
  const loc = useLocation();
  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-ice-border/30 bg-background/50 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_-4px_30px_oklch(0_0_0/0.3)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5 items-end h-14">
        {items.map((it, idx) => {
          const Icon = it.icon;
          const active = loc.pathname === it.to;
          if ("primary" in it && it.primary) {
            return (
              <li key={idx} className="flex justify-center -mt-5">
                <Link
                  to={it.to}
                  search={it.query as any}
                  className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow text-white shadow-glow-cyan flex items-center justify-center active:scale-95 transition"
                  aria-label={it.label}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              </li>
            );
          }
          return (
            <li key={idx} className="flex">
              <Link
                to={it.to}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] transition",
                  active ? "text-cyan-glow" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={it.label}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_currentColor]")} />
                <span className="leading-none">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
