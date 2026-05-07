import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { EnergyProvider } from "@/hooks/useEnergySystem";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

// Lazy load heavy, non-critical components
const FloatingComposeButton = lazy(() => import("@/components/composer/FloatingComposeButton").then(m => ({ default: m.FloatingComposeButton })));
const InstallPrompt = lazy(() => import("@/components/layout/InstallPrompt").then(m => ({ default: m.InstallPrompt })));
const LivingBackground = lazy(() => import("@/components/layout/LivingBackground").then(m => ({ default: m.LivingBackground })));
const AiPresenceOrb = lazy(() => import("@/components/ai/AiPresenceOrb").then(m => ({ default: m.AiPresenceOrb })));

import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate({ to: "/sign-up-login" });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
        <div className="min-h-screen flex w-full bg-[oklch(0.14_0.025_258)]">
          <AppSidebar />
          <main className="flex-1 min-w-0 relative flex flex-col">
            <OfflineBanner />
            <TopBar />
            <div className="flex-1 animate-in fade-in duration-200">
              <Outlet />
            </div>
            <MobileBottomNav />
          </main>
        </div>
      </RealtimeProvider>
    </EnergyProvider>
  );
}
