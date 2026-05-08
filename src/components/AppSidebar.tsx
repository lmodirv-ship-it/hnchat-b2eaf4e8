import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { useLayout } from "@/hooks/useLayoutStore";
import { HnLogo } from "@/components/HnLogo";
import {
  Home, MessageCircle, Users, Bell, LogOut,
  Shield, Settings, Star, Hash, User,
  FileText, Cpu, BookOpen, Newspaper, GitCompare,
  ChevronsRight, ChevronsLeft, X, ChevronDown,
  Video, Radio, ShoppingBag, Store, TrendingUp,
  Compass, MoreHorizontal, Bookmark, Sliders,
  FileEdit, FilePlus, Gamepad2, Globe, Mic,
  Mail, Zap, Film,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── types ── */
interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: number | string;
  highlight?: boolean;
}

interface NavGroup {
  label: string;
  icon: any;
  items: NavItem[];
  defaultOpen?: boolean;
}

/* ── Collapsible section ── */
function SidebarSection({
  group,
  collapsed,
  pathname,
}: {
  group: NavGroup;
  collapsed: boolean;
  pathname: string;
}) {
  const [open, setOpen] = useState(group.defaultOpen ?? false);
  const Icon = group.icon;
  const hasActive = group.items.some(
    (i) => pathname === i.to || pathname.startsWith(i.to + "/"),
  );

  if (collapsed) {
    // Show only the group icon when sidebar is collapsed
    return (
      <div className="flex flex-col items-center gap-0.5">
        {group.items.map((item) => {
          const ItemIcon = item.icon;
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              className={cn(
                "group relative flex items-center justify-center rounded-lg w-10 h-10 transition-all duration-150",
                active
                  ? "bg-[oklch(0.25_0.06_230/0.6)] text-white"
                  : "text-[oklch(0.62_0.02_250)] hover:bg-[oklch(0.18_0.03_250/0.6)] hover:text-[oklch(0.88_0.01_250)]",
              )}
            >
              <ItemIcon className="h-[18px] w-[18px]" />
              <span className="pointer-events-none absolute right-full mr-2 px-2.5 py-1.5 rounded-lg bg-[oklch(0.18_0.03_255)] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-100 shadow-xl border border-[oklch(0.25_0.03_250/0.3)] z-50">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150",
          hasActive
            ? "text-[oklch(0.78_0.12_220)]"
            : "text-[oklch(0.55_0.02_250)] hover:text-[oklch(0.75_0.02_250)]",
        )}
      >
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200 shrink-0",
            !open && "-rotate-90",
          )}
        />
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{group.label}</span>
      </button>

      {open && (
        <div className="mt-0.5 space-y-px pr-2">
          {group.items.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              active={pathname === item.to || pathname.startsWith(item.to + "/")}
              collapsed={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Single link ── */
function SidebarLink({
  item,
  active,
  badge,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  badge?: number | string;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const displayBadge = badge ?? item.badge;
  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center rounded-lg text-[13px] font-medium transition-all duration-150",
        collapsed ? "justify-center p-2 mx-auto w-10 h-10" : "gap-3 px-3 py-2",
        item.highlight
          ? "bg-gradient-to-l from-[oklch(0.35_0.12_220)] to-[oklch(0.25_0.10_230)] text-white shadow-[0_2px_12px_oklch(0.35_0.12_220/0.3)]"
          : active
            ? "bg-[oklch(0.25_0.06_230/0.6)] text-white"
            : "text-[oklch(0.62_0.02_250)] hover:bg-[oklch(0.18_0.03_250/0.6)] hover:text-[oklch(0.88_0.01_250)]",
      )}
    >
      <Icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-[17px] w-[17px]")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {item.highlight && !collapsed && (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[oklch(0.50_0.18_180)] text-white leading-none mr-auto">
          NEW
        </span>
      )}
      {displayBadge && (
        <span
          className={cn(
            "bg-[oklch(0.50_0.18_260)] text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1",
            collapsed ? "absolute -top-0.5 -left-0.5" : "mr-auto",
          )}
        >
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

/* ── Navigation structure matching old hnChat ── */
const NAV_GROUPS: NavGroup[] = [
  {
    label: "التواصل",
    icon: MessageCircle,
    defaultOpen: true,
    items: [
      { to: "/feed", label: "الرئيسية", icon: Home },
      { to: "/messages", label: "المحادثات", icon: MessageCircle },
      { to: "/groups", label: "المجموعات", icon: Users },
      { to: "/pages-groups", label: "القنوات", icon: Hash },
      { to: "/voice", label: "الغرف الصوتية", icon: Mic },
    ],
  },
  {
    label: "الفيديو والبث",
    icon: Video,
    items: [
      { to: "/reels", label: "Reels", icon: Film },
      { to: "/videos", label: "الفيديوهات", icon: Video },
      { to: "/short-videos", label: "فيديوهات قصيرة", icon: Zap },
      { to: "/live", label: "البث المباشر", icon: Radio },
      { to: "/stories", label: "القصص", icon: Globe },
    ],
  },
  {
    label: "التجارة",
    icon: ShoppingBag,
    items: [
      { to: "/marketplace", label: "السوق", icon: Store },
      { to: "/hnshop", label: "متجر HN", icon: ShoppingBag },
      { to: "/trade", label: "التداول", icon: TrendingUp },
    ],
  },
  {
    label: "الذكاء الاصطناعي",
    icon: Cpu,
    defaultOpen: true,
    items: [
      { to: "/ai-assistant", label: "مساعد الذكاء الاصطناعي", icon: Cpu },
      { to: "/tools", label: "أدوات AI", icon: Cpu },
      { to: "/ai-hub", label: "تعلم AI", icon: BookOpen },
      { to: "/trending", label: "أخبار AI", icon: Newspaper },
      { to: "/explore", label: "المقارنات", icon: GitCompare },
    ],
  },
];

const BLOG_ITEMS: NavItem[] = [
  { to: "/blog-dashboard", label: "مقالاتي", icon: FileText },
  { to: "/blog-editor", label: "إنشاء مقال", icon: FilePlus, highlight: true },
];

const MORE_GROUPS: NavGroup[] = [
  {
    label: "أدوات النمو",
    icon: TrendingUp,
    items: [
      { to: "/growth", label: "النمو", icon: TrendingUp },
      { to: "/referral", label: "الإحالات", icon: Users },
      { to: "/ads-manager", label: "مدير الإعلانات", icon: Zap },
    ],
  },
  {
    label: "استكشاف",
    icon: Compass,
    items: [
      { to: "/search", label: "البحث", icon: Compass },
      { to: "/games", label: "الألعاب", icon: Gamepad2 },
      { to: "/app-store", label: "متجر التطبيقات", icon: Globe },
      { to: "/youtube", label: "يوتيوب", icon: Video },
    ],
  },
  {
    label: "المزيد",
    icon: MoreHorizontal,
    items: [
      { to: "/mail", label: "البريد", icon: Mail },
      { to: "/email-dashboard", label: "لوحة البريد", icon: Mail },
      { to: "/monitoring", label: "المراقبة", icon: Shield },
    ],
  },
];

const BOTTOM_FLAT: NavItem[] = [
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/preferences", label: "Preferences", icon: Sliders },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/privacy-policy", label: "Privacy Policy", icon: FileText },
  { to: "/terms-of-service", label: "Terms of Service", icon: FileText },
];

/* ── Main component ── */
export function AppSidebar() {
  const { isAdmin, signOut } = useAuth();
  const { notifUnread, msgUnread } = useRealtime();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useLayout();
  const pathname = location.pathname;
  const collapsed = sidebarCollapsed;

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  const sidebarContent = (isMobileDrawer: boolean) => {
    const c = collapsed && !isMobileDrawer;

    return (
      <div className="flex flex-col h-full">
        {/* Logo header */}
        <div
          className={cn(
            "flex items-center shrink-0 transition-all duration-300 border-b border-[oklch(1_0_0/0.06)]",
            c ? "justify-center px-2 h-[56px]" : "justify-center px-4 h-[56px] gap-2.5 flex-col py-3",
          )}
        >
          <HnLogo size={c ? 26 : 34} showText={false} />
          {!c && (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px] text-white tracking-tight">hnChat</span>
              <span className="text-[9px] font-medium text-[oklch(0.55_0.02_250)] tracking-wider uppercase">
                AI Ecosystem
              </span>
            </div>
          )}
        </div>

        {/* Scrollable navigation */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-2 scrollbar-thin",
            c ? "px-1.5 space-y-0.5" : "px-2 space-y-0.5",
          )}
        >
          {/* Main grouped sections */}
          {NAV_GROUPS.map((group) => (
            <SidebarSection
              key={group.label}
              group={{
                ...group,
                items: group.items.map((item) =>
                  item.to === "/messages" && msgUnread > 0
                    ? { ...item, badge: msgUnread }
                    : item,
                ),
              }}
              collapsed={c}
              pathname={pathname}
            />
          ))}

          {/* Blog section — standalone */}
          {!c && (
            <>
              <div className="h-px bg-[oklch(1_0_0/0.06)] my-2" />
              <div className="px-3 py-1">
                <span className="text-[11px] font-semibold text-[oklch(0.55_0.02_250)] uppercase tracking-wider">
                  المدونة
                </span>
              </div>
              {BLOG_ITEMS.map((item) => (
                <SidebarLink
                  key={item.to}
                  item={item}
                  active={isActive(item.to)}
                  collapsed={false}
                />
              ))}
              {/* Public blog link */}
              <SidebarLink
                item={{ to: "/blog", label: "تصفح المقالات", icon: BookOpen }}
                active={isActive("/blog") && !isActive("/blog-dashboard") && !isActive("/blog-editor")}
                collapsed={false}
              />
            </>
          )}
          {c && (
            <>
              <SidebarLink item={{ to: "/blog-dashboard", label: "مقالاتي", icon: FileText }} active={isActive("/blog-dashboard")} collapsed={true} />
              <SidebarLink item={{ to: "/blog-editor", label: "إنشاء مقال", icon: FilePlus }} active={isActive("/blog-editor")} collapsed={true} />
            </>
          )}

          {/* More groups */}
          <div className={cn("h-px bg-[oklch(1_0_0/0.06)] my-2", c && "mx-1")} />
          {MORE_GROUPS.map((group) => (
            <SidebarSection key={group.label} group={group} collapsed={c} pathname={pathname} />
          ))}

          {/* Flat bottom items */}
          <div className={cn("h-px bg-[oklch(1_0_0/0.06)] my-2", c && "mx-1")} />
          {BOTTOM_FLAT.map((item) => (
            <SidebarLink
              key={item.to}
              item={item}
              active={isActive(item.to)}
              collapsed={c}
              badge={
                item.to === "/notifications" && notifUnread > 0
                  ? notifUnread
                  : undefined
              }
            />
          ))}

          {/* Admin */}
          {isAdmin && (
            <>
              <div className={cn("h-px bg-[oklch(1_0_0/0.06)] my-2", c && "mx-1")} />
              <SidebarLink
                item={{ to: "/admin", label: "لوحة التحكم", icon: Shield }}
                active={isActive("/admin")}
                collapsed={c}
              />
            </>
          )}
        </nav>

        {/* Footer controls */}
        <div
          className={cn(
            "shrink-0 border-t border-[oklch(1_0_0/0.06)]",
            c ? "p-1.5" : "p-2",
          )}
        >
          {!isMobileDrawer && (
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="hidden md:flex w-full items-center justify-center gap-2 p-2 rounded-lg text-[11px] text-[oklch(0.50_0.02_250)] hover:bg-[oklch(0.18_0.03_250/0.5)] hover:text-white transition-colors"
              title={collapsed ? "توسيع القائمة" : "طي القائمة"}
            >
              {collapsed ? (
                <ChevronsLeft className="h-4 w-4" />
              ) : (
                <>
                  <ChevronsRight className="h-4 w-4" />
                  <span>طي</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className={cn(
              "w-full flex items-center rounded-lg text-[11px] text-[oklch(0.50_0.02_250)] hover:bg-[oklch(0.18_0.03_250/0.5)] hover:text-red-400 transition-colors",
              c ? "justify-center p-2" : "gap-2 p-2",
            )}
            title={collapsed ? "تسجيل الخروج" : undefined}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!c && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:block shrink-0 bg-[oklch(0.09_0.02_258)] border-l border-[oklch(1_0_0/0.07)] h-full transition-[width] duration-300 ease-in-out",
          collapsed ? "w-[56px]" : "w-[240px]",
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
          <aside className="relative w-[280px] bg-[oklch(0.09_0.02_258)] border-l border-[oklch(1_0_0/0.07)] h-full animate-slide-in-right shadow-2xl">
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
