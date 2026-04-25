import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { HnLogo } from "@/components/HnLogo";
import {
  Home, Video, MessageCircle, ShoppingBag, Compass, Users, Bell,
  User, LogOut, Shield, Sparkles, Radio, Mic, BookOpen, Gift,
  TrendingUp, Globe, Bot, Settings,
} from "lucide-react";

const NAV = [
  { to: "/feed", label: "Feed", icon: Home },
  { to: "/videos", label: "Videos", icon: Video },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/live", label: "Live", icon: Radio },
  { to: "/voice", label: "Voice Rooms", icon: Mic },
  { to: "/stories", label: "Stories", icon: BookOpen },
  { to: "/invite", label: "Invite & Earn", icon: Gift },
  { to: "/trade", label: "hnTrade", icon: TrendingUp },
  { to: "/geo", label: "GeoContent", icon: Globe },
  { to: "/ai-hub", label: "AI Hub", icon: Bot },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppSidebar() {
  const { user, isAdmin, signOut, roles } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex w-64 flex-col border-l border-ice-border bg-sidebar/60 backdrop-blur-xl sticky top-0 h-screen">
      <div className="p-4 border-b border-ice-border flex items-center gap-2">
        <HnLogo className="h-8 w-8" />
        <div>
          <div className="font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">hnChat</div>
          <div className="text-[10px] text-muted-foreground">Your World. One App.</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                active
                  ? "bg-gradient-to-r from-cyan-glow/15 to-violet-glow/10 text-foreground shadow-[inset_0_0_0_1px_oklch(0.78_0.18_220/0.3)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="mt-4 mb-2 px-3 text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Admin
            </div>
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
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
            <div className="text-[10px] text-muted-foreground">
              {isAdmin ? "Admin" : roles[0] ?? "user"}
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
