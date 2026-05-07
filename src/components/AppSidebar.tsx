import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { useLayout } from "@/hooks/useLayoutStore";
import { HnLogo } from "@/components/HnLogo";
import {
  Home, MessageCircle, Users, Bell, LogOut,
  Shield, Settings, Star, Hash,
  FileText, Cpu, BookOpen, Newspaper, GitCompare,
  ChevronsRight, ChevronsLeft, X, Sparkles, ChevronUp,
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
  { to: "/trending", label: "أخبار الذكاء الاصطناعي", icon: Newspaper },
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
        "group relative flex items-center rounded-lg text-[13px] font-medium transition-all duration-150",
        collapsed ? "justify-center p-2 mx-auto w-10 h-10" : "gap-3 px-3 py-2",
        active
          ? "bg-[oklch(0.25_0.06_230/0.6)] text-white"
          : "text-[oklch(0.62_0.02_250)] hover:bg-[oklch(0.18_0.03_250/0.6)] hover:text-[oklch(0.88_0.01_250)]"
      )}
    >
      <Icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-[17px] w-[17px]")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {displayBadge && (
        <span className={cn(
          "bg-[oklch(0.50_0.18_260)] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1",
          collapsed ? "absolute -top-0.5 -left-0.5" : "mr-auto"
        )}>
          {displayBadge}
        </span>
      )}
      {collapsed && (
        <span className="pointer-events-none absolute right-full mr-2 px-2.5 py-1.5 rounded-lg bg-[oklch(0.18_0.03_255)] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-100 shadow-xl border border-[oklch(0.25_0.03_250/0.3)] z-50">
          {item.label}
        </span>
      )}
    </Link>
  );
}

export function AppSidebar() {
  const { isAdmin, signOut } = useAuth();
  const { notifUnread, msgUnread } = useRealtime();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useLayout();
  const pathname = location.pathname;
  const collapsed = sidebarCollapsed;
  const [proMinimized, setProMinimized] = useState(false);

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  const sidebarContent = (isMobileDrawer: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo header */}
      <div className={cn(
        "flex items-center shrink-0 transition-all duration-300",
        collapsed && !isMobileDrawer ? "justify-center px-2 h-[52px]" : "px-4 h-[52px] gap-2.5"
      )}>
        <HnLogo size={collapsed && !isMobileDrawer ? 26 : 30} showText={false} />
        {(!collapsed || isMobileDrawer) && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-bold text-[15px] text-white tracking-tight">hnChat</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[oklch(0.50_0.18_260)] text-white leading-none">AI+</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-1.5 space-y-px scrollbar-thin",
        collapsed && !isMobileDrawer ? "px-1.5" : "px-2"
      )}>
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} active={isActive(item.to)} collapsed={collapsed && !isMobileDrawer} />
        ))}

        <div className={cn("h-px bg-[oklch(1_0_0/0.06)] my-2", collapsed && !isMobileDrawer && "mx-1")} />

        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            item={item}
            active={isActive(item.to)}
            collapsed={collapsed && !isMobileDrawer}
            badge={
              item.to === "/messages" && msgUnread > 0 ? msgUnread :
              item.to === "/notifications" && notifUnread > 0 ? notifUnread :
              undefined
            }
          />
        ))}

        {isAdmin && (
          <>
            <div className={cn("h-px bg-[oklch(1_0_0/0.06)] my-2", collapsed && !isMobileDrawer && "mx-1")} />
            <SidebarLink
              item={{ to: "/admin", label: "لوحة التحكم", icon: Shield }}
              active={isActive("/admin")}
              collapsed={collapsed && !isMobileDrawer}
            />
          </>
        )}
      </nav>

      {/* Pro card — compact, collapsible */}
      {collapsed && !isMobileDrawer ? (
        /* Collapsed sidebar: just an icon button */
        <div className="flex justify-center px-1.5 mb-1">
          <button
            className="p-2 rounded-lg bg-[oklch(0.15_0.03_260/0.6)] border border-[oklch(1_0_0/0.06)] hover:bg-[oklch(0.20_0.04_260/0.6)] transition-colors"
            title="hnChat Pro — ترقية"
          >
            <Sparkles className="h-4 w-4 text-[oklch(0.65_0.18_260)]" />
          </button>
        </div>
      ) : proMinimized ? (
        /* Minimized: single-line bar */
        <button
          onClick={() => setProMinimized(false)}
          className="mx-2 mb-1.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[oklch(0.13_0.025_260/0.7)] border border-[oklch(1_0_0/0.05)] hover:bg-[oklch(0.16_0.03_260/0.7)] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[oklch(0.65_0.18_260)]" />
            <span className="text-[10px] font-semibold text-[oklch(0.65_0.18_260)]">hnChat Pro</span>
          </div>
          <ChevronUp className="h-3 w-3 text-[oklch(0.45_0.02_250)] rotate-180" />
        </button>
      ) : (
        /* Expanded: compact card */
        <div className="mx-2 mb-1.5 px-2.5 py-2 rounded-lg bg-[oklch(0.13_0.025_260/0.7)] border border-[oklch(1_0_0/0.05)]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[oklch(0.65_0.18_260)]" />
              <span className="font-bold text-[10px] text-white">hnChat Pro</span>
            </div>
            <button
              onClick={() => setProMinimized(true)}
              className="p-0.5 rounded hover:bg-[oklch(1_0_0/0.06)] transition-colors"
              title="تصغير"
            >
              <ChevronUp className="h-3 w-3 text-[oklch(0.45_0.02_250)]" />
            </button>
          </div>
          <button className="w-full py-1 rounded-md bg-[oklch(0.50_0.18_260)] hover:bg-[oklch(0.55_0.18_260)] text-white text-[10px] font-bold transition-colors">
            ترقية الآن
          </button>
        </div>
      )}

      {/* Footer controls */}
      <div className={cn(
        "shrink-0 border-t border-[oklch(1_0_0/0.06)]",
        collapsed && !isMobileDrawer ? "p-1.5" : "p-2"
      )}>
        {!isMobileDrawer && (
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="hidden md:flex w-full items-center justify-center gap-2 p-2 rounded-lg text-[11px] text-[oklch(0.50_0.02_250)] hover:bg-[oklch(0.18_0.03_250/0.5)] hover:text-white transition-colors"
            title={collapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {collapsed ? <ChevronsLeft className="h-4 w-4" /> : (
              <><ChevronsRight className="h-4 w-4" /><span>طي</span></>
            )}
          </button>
        )}
        <button
          onClick={async () => { await signOut(); navigate({ to: "/" }); }}
          className={cn(
            "w-full flex items-center rounded-lg text-[11px] text-[oklch(0.50_0.02_250)] hover:bg-[oklch(0.18_0.03_250/0.5)] hover:text-red-400 transition-colors",
            collapsed && !isMobileDrawer ? "justify-center p-2" : "gap-2 p-2"
          )}
          title={collapsed ? "تسجيل الخروج" : undefined}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {(!collapsed || isMobileDrawer) && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — flush, no rounded corners, app-native feel */}
      <aside
        className={cn(
          "hidden md:block shrink-0 bg-[oklch(0.09_0.02_258)] border-l border-[oklch(1_0_0/0.07)] h-full transition-[width] duration-300 ease-in-out",
          collapsed ? "w-[56px]" : "w-[220px]"
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative w-[260px] bg-[oklch(0.09_0.02_258)] border-l border-[oklch(1_0_0/0.07)] h-full animate-slide-in-right shadow-2xl">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-2 left-2 p-2 rounded-lg hover:bg-[oklch(0.18_0.03_250/0.5)] transition z-10"
            >
              <X className="h-5 w-5 text-[oklch(0.60_0.02_250)]" />
            </button>
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
