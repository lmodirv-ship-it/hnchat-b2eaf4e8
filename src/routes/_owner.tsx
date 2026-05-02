import { createFileRoute, Outlet, Link, useLocation, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Crown, Users, FileText, ShoppingBag, ShieldAlert, Settings, Activity, DollarSign, Globe, Flag, Power, LogOut, Bell } from "lucide-react";
import { OwnerCommandPalette } from "@/components/owner/OwnerCommandPalette";

// Secret obscured path. Keep in sync with internal docs only.
export const Route = createFileRoute("/_owner")({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: "/sign-up-login", search: { from: location.pathname } as any });
    }
  },
  component: OwnerShell,
});

type NavItem = { to: string; label: string; icon: any; exact?: boolean };
type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: "الرئيسية",
    items: [
      { to: "/owner-x9k2m7", label: "Mission Control", icon: Crown, exact: true },
    ],
  },
  {
    title: "المستخدمين والمحتوى",
    items: [
      { to: "/owner-x9k2m7/users", label: "User Operations", icon: Users },
      { to: "/owner-x9k2m7/content", label: "Content & Moderation", icon: FileText },
      { to: "/owner-x9k2m7/groups", label: "Groups Network", icon: Flag },
    ],
  },
  {
    title: "المالية والتجارة",
    items: [
      { to: "/owner-x9k2m7/marketplace", label: "Commerce & Revenue", icon: ShoppingBag },
      { to: "/owner-x9k2m7/finance", label: "Finance", icon: DollarSign },
    ],
  },
  {
    title: "النظام والأمان",
    items: [
      { to: "/owner-x9k2m7/features", label: "Feature Flags", icon: Power },
      { to: "/owner-x9k2m7/security", label: "Security & RLS", icon: ShieldAlert },
      { to: "/owner-x9k2m7/audit", label: "Audit Logs", icon: Activity },
      { to: "/owner-x9k2m7/geography", label: "Geo & Language", icon: Globe },
      { to: "/owner-x9k2m7/settings", label: "System Settings", icon: Settings },
    ],
  },
];

function OwnerShell() {
  const { isOwner, isLoading, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isOwner) {
      // Don't redirect to admin or anywhere obvious — pretend page doesn't exist
      navigate({ to: "/feed" });
    }
  }, [isOwner, isLoading, navigate]);

  if (isLoading || !isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-[oklch(0.04_0.01_280)]">
      {/* Distinct dark gold/red theme — clearly NOT the public app */}
      <aside className="w-72 border-r border-[oklch(0.2_0.05_30)] bg-gradient-to-b from-[oklch(0.06_0.02_30)] to-[oklch(0.04_0.01_280)] sticky top-0 h-screen flex flex-col">
        <div className="p-5 border-b border-[oklch(0.2_0.05_30)]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[oklch(0.75_0.18_50)] to-[oklch(0.55_0.22_25)] flex items-center justify-center shadow-[0_0_24px_oklch(0.75_0.18_50/0.4)]">
              <Crown className="h-5 w-5 text-[oklch(0.04_0.01_280)]" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-[oklch(0.85_0.15_50)]">OWNER CONSOLE</div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[oklch(0.55_0.05_50)]">Restricted · Level 0</div>
            </div>
          </div>
          <OwnerCommandPalette />
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  active
                    ? "bg-gradient-to-r from-[oklch(0.75_0.18_50/0.18)] to-[oklch(0.55_0.22_25/0.12)] text-[oklch(0.92_0.1_50)] shadow-[inset_0_0_0_1px_oklch(0.75_0.18_50/0.3)]"
                    : "text-[oklch(0.65_0.04_40)] hover:bg-[oklch(0.1_0.03_40)] hover:text-[oklch(0.85_0.1_50)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[oklch(0.2_0.05_30)]">
          <div className="text-[10px] text-[oklch(0.5_0.04_40)] mb-2 px-1">{user?.email}</div>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/sign-up-login" }); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-[oklch(0.6_0.05_40)] hover:bg-destructive/15 hover:text-destructive transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> End Session
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 relative">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-[oklch(0.75_0.18_50/0.06)] blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[oklch(0.55_0.22_25/0.05)] blur-3xl" />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
