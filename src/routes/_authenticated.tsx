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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 min-w-0 relative flex flex-col">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-cyan-glow/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-glow/10 blur-3xl" />
        </div>
        <OfflineBanner />
        <TopBar />
        <div className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </div>
        <FloatingComposeButton />
        <MobileBottomNav />
        <InstallPrompt />
      </main>
    </div>
  );
}
