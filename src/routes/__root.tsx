import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "hnChat — Your World. One App." },
      {
        name: "description",
        content:
          "hnChat unifies social networking, short videos, live streams, marketplace, and more in one futuristic super-app.",
      },
      { name: "theme-color", content: "#050508" },
      { property: "og:title", content: "hnChat — Your World. One App." },
      {
        property: "og:description",
        content: "Messaging, short videos, live streams, marketplace, AI — all in one app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "oklch(0.08 0.02 270 / 0.95)",
              border: "1px solid oklch(1 0 0 / 0.08)",
              color: "oklch(0.97 0.01 250)",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-gradient text-8xl font-bold">404</h1>
        <p className="mt-4 text-xl font-semibold">Page Not Found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist. Let's get you back!
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/"
            className="rounded-xl bg-gradient-button px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-cyan transition-transform hover:scale-105"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
