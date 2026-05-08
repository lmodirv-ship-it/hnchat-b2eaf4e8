import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { EnergyProvider } from "@/hooks/useEnergySystem";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import { LayoutContext } from "@/hooks/useLayoutStore";

import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/sign-up-login" });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[oklch(0.10_0.025_258)]">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-breathe" />
        </div>
      </div>
    );
  }

  return (
    <EnergyProvider>
      <RealtimeProvider>
        <LayoutContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen }}>
          {/* App shell — fixed viewport, no outer scroll like Discord/Telegram */}
            <div
              className="h-screen w-screen overflow-hidden flex"
              style={{ backgroundColor: "var(--theme-bg, oklch(0.10 0.02 258))", color: "var(--theme-text, inherit)" }}
            >
              <AppSidebar />
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <OfflineBanner />
                <TopBar />
                {/* Content area scrolls internally */}
                <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <Outlet />
              </main>
              <MobileBottomNav />
            </div>
          </div>
        </LayoutContext.Provider>
      </RealtimeProvider>
    </EnergyProvider>
  );
}
