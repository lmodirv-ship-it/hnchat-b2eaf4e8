import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingComposeButton } from "@/components/composer/FloatingComposeButton";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { LivingBackground } from "@/components/layout/LivingBackground";
import { AiPresenceOrb } from "@/components/ai/AiPresenceOrb";
import { EnergyProvider } from "@/hooks/useEnergySystem";

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
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 min-w-0 relative flex flex-col">
          <LivingBackground />
          <OfflineBanner />
          <TopBar />
          <div className="flex-1 pb-16 md:pb-0 animate-in fade-in duration-200">
            <Outlet />
          </div>
          <SiteFooter />
          <FloatingComposeButton />
          <MobileBottomNav />
          <InstallPrompt />
          <AiPresenceOrb />
        </main>
      </div>
    </EnergyProvider>
  );
}
