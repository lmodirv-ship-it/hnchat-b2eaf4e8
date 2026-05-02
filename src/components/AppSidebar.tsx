import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { HnLogo } from "@/components/HnLogo";
import {
  Home, Video, MessageCircle, ShoppingBag, Users, Bell,
  User, LogOut, Shield, Sparkles, Radio, Mic, BookOpen, Gift,
  TrendingUp, Globe, Bot, ShoppingCart, Film, Megaphone, Zap,
  Search, Store, Gamepad2, BarChart3, Send, Mail, Activity,
  Settings, Cpu, Bookmark, FileText, ScrollText, Youtube, Inbox,
  ChevronDown,
} from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: any;
  badge?: { text: string; tone: "new" | "ai" | "live" | "count" };
};

type NavGroup = {
  label: string;
  items: readonly NavItem[];
};

const GROUPS: readonly NavGroup[] = [
  {
    label: "التواصل",
    items: [
      { to: "/feed", label: "Home Feed", icon: Home },
      { to: "/messages", label: "Messages", icon: MessageCircle, badge: { text: "12", tone: "count" } },
      { to: "/mail", label: "البريد", icon: Inbox, badge: { text: "NEW", tone: "new" } },
      { to: "/voice", label: "Voice Rooms", icon: Mic, badge: { text: "2", tone: "count" } },
      { to: "/pages-groups", label: "Pages & Groups", icon: Users },
      { to: "/stories", label: "Stories", icon: BookOpen },
    ],
  },
  {
    label: "الفيديو والبث",
    items: [
      { to: "/reels", label: "Reels", icon: Film, badge: { text: "HOT", tone: "live" } },
      { to: "/videos", label: "Videos & Live", icon: Video, badge: { text: "3", tone: "count" } },
      { to: "/youtube", label: "YouTube قنوات", icon: Youtube, badge: { text: "NEW", tone: "new" } },
      { to: "/live", label: "Live Stream", icon: Radio, badge: { text: "LIVE", tone: "live" } },
      { to: "/short-videos", label: "Short Videos", icon: Film },
    ],
  },
  {
    label: "التجارة",
    items: [
      { to: "/hnshop", label: "hnShop", icon: ShoppingCart, badge: { text: "NEW", tone: "new" } },
      { to: "/marketplace", label: "Marketplace", icon: ShoppingBag },
      { to: "/trade", label: "hnTrade Crypto", icon: TrendingUp },
      { to: "/invite", label: "Invite & Earn", icon: Gift },
    ],
  },
  {
    label: "الذكاء الاصطناعي",
    items: [
      { to: "/ai-hub", label: "hn AI Hub", icon: Bot, badge: { text: "AI", tone: "ai" } },
      { to: "/ai-assistant", label: "AI Assistant", icon: Cpu },
    ],
  },
  {
    label: "أدوات النمو",
    items: [
      { to: "/ads-manager", label: "Ads Manager", icon: Megaphone },
      { to: "/ads-promo", label: "Ads & Promo", icon: Zap },
      { to: "/growth", label: "Growth Analytics", icon: BarChart3 },
      { to: "/push", label: "Push Strategy", icon: Send },
      { to: "/email-dashboard", label: "Email Dashboard", icon: Mail },
      { to: "/monitoring", label: "Monitoring Pro", icon: Activity },
    ],
  },
  {
    label: "استكشاف",
    items: [
      { to: "/search", label: "Search", icon: Search },
      { to: "/geo", label: "GeoContent", icon: Globe },
      { to: "/app-store", label: "App Store", icon: Store },
      { to: "/games", label: "Games Hub", icon: Gamepad2 },
    ],
  },
] as const;

const MORE: readonly NavItem[] = [
  { to: "/notifications", label: "Notifications", icon: Bell, badge: { text: "5", tone: "count" } },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/preferences", label: "Preferences", icon: Settings },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/privacy-policy", label: "Privacy Policy", icon: FileText },
  { to: "/terms-of-service", label: "Terms of Service", icon: ScrollText },
] as const;

function Badge({ tone, text }: { tone: "new" | "ai" | "live" | "count"; text: string }) {
  const cls =
    tone === "new"
      ? "bg-cyan-glow/20 text-cyan-glow border-cyan-glow/40"
      : tone === "ai"
      ? "bg-violet-glow/20 text-violet-glow border-violet-glow/40"
      : tone === "live"
      ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
      : "bg-pink-glow/20 text-pink-glow border-pink-glow/40";
  return (
    <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {text}
    </span>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all ${
        active
          ? "bg-gradient-to-r from-cyan-glow/15 to-violet-glow/10 text-foreground shadow-[inset_0_0_0_1px_oklch(0.78_0.18_220/0.3)]"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.badge && <Badge tone={item.badge.tone} text={item.badge.text} />}
    </Link>
  );
}

function CollapsibleGroup({ group, pathname }: { group: NavGroup; pathname: string }) {
  const hasActive = group.items.some(
    (i) => pathname === i.to || pathname.startsWith(i.to + "/")
  );
  const [open, setOpen] = useState(hasActive);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{group.label}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              active={pathname === item.to || pathname.startsWith(item.to + "/")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AppSidebar() {
  const { user, isAdmin, signOut, roles } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex w-64 flex-col border-l border-ice-border/30 bg-background/50 backdrop-blur-2xl backdrop-saturate-150 sticky top-0 h-screen shadow-[4px_0_30px_oklch(0_0_0/0.2)]">
      <div className="p-4 border-b border-ice-border flex items-center gap-2">
        <HnLogo className="h-9 w-9" />
        <div className="min-w-0">
          <div className="font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">hnChat</div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Super App</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {GROUPS.map((group) => (
          <CollapsibleGroup key={group.label} group={group} pathname={location.pathname} />
        ))}

        <div className="mt-3 mb-1 px-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          المزيد
        </div>
        {MORE.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            active={location.pathname === item.to || location.pathname.startsWith(item.to + "/")}
          />
        ))}

        {isAdmin && (
          <>
            <div className="mt-3 mb-1 px-3 text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Admin
            </div>
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all ${
                location.pathname.startsWith("/admin")
                  ? "bg-gradient-to-r from-pink-glow/20 to-violet-glow/15 text-foreground shadow-[inset_0_0_0_1px_oklch(0.65_0.25_295/0.4)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-ice-border">
        <div className="flex items-center gap-2 mb-2 px-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center text-xs font-bold text-primary-foreground">
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate">{user?.email}</div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {isAdmin ? "Admin" : roles[0] ?? "Online"}
            </div>
          </div>
        </div>
        <button
          onClick={async () => { await signOut(); navigate({ to: "/sign-up-login" }); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
