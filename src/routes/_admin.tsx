import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Loader2, Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) navigate({ to: "/sign-up-login" });
      else if (!isAdmin) navigate({ to: "/feed" });
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/content", label: "Content" },
    { to: "/admin/marketplace", label: "Marketplace" },
    { to: "/admin/analytics", label: "Analytics" },
  ] as const;

  return (
    <div className="min-h-screen relative">
      {/* Admin is desktop-only */}
      <div className="md:hidden flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <Shield className="h-12 w-12 text-pink-glow mb-4" />
        <h1 className="text-xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-muted-foreground text-sm">لوحة الإدارة متاحة فقط من الحاسوب</p>
        <Link to="/feed" className="mt-6 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
          العودة للتطبيق
        </Link>
      </div>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-pink-glow/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-glow/15 blur-3xl" />
      </div>

      <header className="border-b border-ice-border bg-sidebar/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/feed" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> App
          </Link>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-pink-glow" />
            <span className="font-bold bg-gradient-to-r from-pink-glow to-violet-glow bg-clip-text text-transparent">Admin Console</span>
          </div>
          <nav className="ms-auto flex items-center gap-1">
            {tabs.map((t) => {
              const active = location.pathname === t.to;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-pink-glow/25 to-violet-glow/20 text-foreground shadow-[inset_0_0_0_1px_oklch(0.65_0.25_295/0.4)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
