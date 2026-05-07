import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { HnLogo } from "@/components/HnLogo";
import {
  Home, MessageCircle, Users, Bell, LogOut,
  Shield, Sparkles, Settings, Star, Hash,
  FileText, Cpu, BookOpen, Newspaper, GitCompare,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  to: string;
  label: string;
  icon: any;
  badge?: number | string;
}

const NAV_ITEMS: SidebarItem[] = [
  { to: "/feed", label: "الرئيسية", icon: Home },
  { to: "/blog", label: "المقالات", icon: FileText },
  { to: "/tools", label: "أدوات الذكاء الاصطناعي", icon: Cpu },
  { to: "/ai-hub", label: "تعلم الذكاء الاصطناعي", icon: BookOpen },
  { to: "/trending", label: "الأخبار", icon: Newspaper },
  { to: "/explore", label: "المقارنات", icon: GitCompare },
  { to: "/pages-groups", label: "القنوات", icon: Hash },
  { to: "/bookmarks", label: "المفضلة", icon: Star },
];

const BOTTOM_ITEMS: SidebarItem[] = [
  { to: "/messages", label: "المحادثات", icon: MessageCircle },
  { to: "/groups", label: "المجموعات", icon: Users },
  { to: "/notifications", label: "الإشعارات", icon: Bell },
  { to: "/settings", label: "الإعدادات", icon: Settings },
];

function SidebarLink({ item, active, badge }: { item: SidebarItem; active: boolean; badge?: number | string }) {
  const Icon = item.icon;
  const displayBadge = badge ?? item.badge;
  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        active
          ? "bg-[oklch(0.35_0.08_230/0.5)] text-white shadow-[0_0_20px_oklch(0.45_0.12_230/0.15)]"
          : "text-[oklch(0.65_0.02_250)] hover:bg-[oklch(0.20_0.03_250/0.5)] hover:text-[oklch(0.85_0.01_250)]"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{item.label}</span>
      {displayBadge && (
        <span className="mr-auto bg-[oklch(0.45_0.15_260)] text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
          {displayBadge}
        </span>
      )}
    </Link>
  );
}

export function AppSidebar() {
  const { user, isAdmin, signOut, roles } = useAuth();
  const { notifUnread, msgUnread } = useRealtime();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <aside className="hidden md:flex w-60 flex-col bg-[oklch(0.12_0.025_255)] border-l border-[oklch(0.25_0.03_250/0.3)] sticky top-0 h-screen">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-2.5">
        <HnLogo size={34} showText={false} />
        <div>
          <span className="font-bold text-base text-white tracking-tight">hnChat</span>
          <span className="inline-flex items-center mr-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[oklch(0.45_0.15_260)] text-white">AI+</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} active={isActive(item.to)} />
        ))}

        <div className="h-px bg-[oklch(0.25_0.03_250/0.2)] my-3" />

        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            item={item}
            active={isActive(item.to)}
            badge={
              item.to === "/messages" && msgUnread > 0 ? msgUnread :
              item.to === "/notifications" && notifUnread > 0 ? notifUnread :
              undefined
            }
          />
        ))}

        {isAdmin && (
          <>
            <div className="h-px bg-[oklch(0.25_0.03_250/0.2)] my-3" />
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive("/admin")
                  ? "bg-[oklch(0.35_0.15_295/0.3)] text-white"
                  : "text-[oklch(0.65_0.02_250)] hover:bg-[oklch(0.20_0.03_250/0.5)] hover:text-white"
              )}
            >
              <Shield className="h-[18px] w-[18px]" />
              <span>لوحة التحكم</span>
            </Link>
          </>
        )}
      </nav>

      {/* Pro upgrade card */}
      <div className="mx-3 mb-3 p-4 rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.04_255)] to-[oklch(0.15_0.05_270)] border border-[oklch(0.30_0.05_260/0.3)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm text-white">hnChat Pro</span>
          <span className="text-lg">🔥</span>
        </div>
        <p className="text-[11px] text-[oklch(0.60_0.02_250)] mb-3 leading-relaxed">
          احصل على تجربة أفضل ومميزات حصرية
        </p>
        <button className="w-full py-2 rounded-xl bg-[oklch(0.45_0.15_260)] hover:bg-[oklch(0.50_0.15_260)] text-white text-xs font-bold transition-colors">
          ترقية الآن
        </button>
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-[oklch(0.25_0.03_250/0.2)]">
        <button
          onClick={async () => { await signOut(); navigate({ to: "/" }); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[oklch(0.55_0.02_250)] hover:bg-[oklch(0.20_0.03_250/0.5)] hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
