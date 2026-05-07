import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { useLayout } from "@/hooks/useLayoutStore";
import { HnLogo } from "@/components/HnLogo";
import {
  Home, MessageCircle, Users, Bell, LogOut,
  Shield, Settings, Star, Hash,
  FileText, Cpu, BookOpen, Newspaper, GitCompare,
  ChevronsRight, ChevronsLeft, X,
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

function SidebarLink({ item, active, badge, collapsed }: { item: SidebarItem; active: boolean; badge?: number | string; collapsed: boolean }) {
  const Icon = item.icon;
  const displayBadge = badge ?? item.badge;
  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
        collapsed ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : "gap-3 px-4 py-2.5",
        active
          ? "bg-[oklch(0.35_0.08_230/0.5)] text-white shadow-[0_0_20px_oklch(0.45_0.12_230/0.15)]"
          : "text-[oklch(0.65_0.02_250)] hover:bg-[oklch(0.20_0.03_250/0.5)] hover:text-[oklch(0.85_0.01_250)]"
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {displayBadge && (
        <span className={cn(
          "bg-[oklch(0.45_0.15_260)] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1",
          collapsed ? "absolute -top-1 -left-1" : "mr-auto"
        )}>
          {displayBadge}
        </span>
      )}
      {/* Tooltip on collapsed */}
      {collapsed && (
        <span className="pointer-events-none absolute right-full mr-2 px-2 py-1 rounded-lg bg-[oklch(0.20_0.04_255)] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-50">
          {item.label}
        </span>
      )}
    </Link>
  );
}

export function AppSidebar() {
  const { user, isAdmin, signOut } = useAuth();
  const { notifUnread, msgUnread } = useRealtime();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useLayout();
  const pathname = location.pathname;
  const collapsed = sidebarCollapsed;

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={cn("flex items-center border-b border-[oklch(0.25_0.03_250/0.15)] transition-all duration-300", collapsed ? "justify-center px-2 py-4" : "px-5 py-4 gap-2.5")}>
        <HnLogo size={collapsed ? 28 : 34} showText={false} />
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-bold text-base text-white tracking-tight">hnChat</span>
            <span className="inline-flex items-center mr-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[oklch(0.45_0.15_260)] text-white">AI+</span>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className={cn("flex-1 overflow-y-auto py-2 space-y-0.5 transition-all duration-300", collapsed ? "px-1.5" : "px-3")}>
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} active={isActive(item.to)} collapsed={collapsed} />
        ))}

        <div className={cn("h-px bg-[oklch(0.25_0.03_250/0.2)] my-3", collapsed && "mx-1")} />

        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            item={item}
            active={isActive(item.to)}
            collapsed={collapsed}
            badge={
              item.to === "/messages" && msgUnread > 0 ? msgUnread :
              item.to === "/notifications" && notifUnread > 0 ? notifUnread :
              undefined
            }
          />
        ))}

        {isAdmin && (
          <>
            <div className={cn("h-px bg-[oklch(0.25_0.03_250/0.2)] my-3", collapsed && "mx-1")} />
            <Link
              to="/admin"
              title={collapsed ? "لوحة التحكم" : undefined}
              className={cn(
                "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : "gap-3 px-4 py-2.5",
                isActive("/admin")
                  ? "bg-[oklch(0.35_0.15_295/0.3)] text-white"
                  : "text-[oklch(0.65_0.02_250)] hover:bg-[oklch(0.20_0.03_250/0.5)] hover:text-white"
              )}
            >
              <Shield className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>لوحة التحكم</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Pro upgrade card - hidden when collapsed */}
      {!collapsed && (
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
      )}

      {/* Collapse toggle + sign out */}
      <div className={cn("border-t border-[oklch(0.25_0.03_250/0.2)] transition-all duration-300", collapsed ? "p-2" : "p-3")}>
        {/* Collapse button - desktop only */}
        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-[oklch(0.55_0.02_250)] hover:bg-[oklch(0.20_0.03_250/0.5)] hover:text-white transition-colors mb-1"
          title={collapsed ? "توسيع القائمة" : "طي القائمة"}
        >
          {collapsed ? (
            <ChevronsLeft className="h-4 w-4" />
          ) : (
            <>
              <ChevronsRight className="h-4 w-4" />
              <span>طي القائمة</span>
            </>
          )}
        </button>
        <button
          onClick={async () => { await signOut(); navigate({ to: "/" }); }}
          className={cn(
            "w-full flex items-center rounded-xl text-xs text-[oklch(0.55_0.02_250)] hover:bg-[oklch(0.20_0.03_250/0.5)] hover:text-red-400 transition-colors",
            collapsed ? "justify-center p-2" : "gap-2 px-3 py-2"
          )}
          title={collapsed ? "تسجيل الخروج" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-[oklch(0.12_0.025_255)] border-l border-[oklch(0.25_0.03_250/0.3)] sticky top-0 h-screen transition-all duration-300 ease-in-out",
          collapsed ? "w-[60px]" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-64 flex flex-col bg-[oklch(0.12_0.025_255)] border-l border-[oklch(0.25_0.03_250/0.3)] h-full animate-slide-in-right shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-3 left-3 p-2 rounded-xl hover:bg-[oklch(0.20_0.03_250/0.5)] transition z-10"
            >
              <X className="h-5 w-5 text-[oklch(0.65_0.02_250)]" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
