import { Outlet, Link, createRootRoute, HeadContent, Scripts, ScriptOnce, useLocation } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { ExternalLinkGuard } from "@/components/system/ExternalLinkGuard";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { NativeStatusBar } from "@/components/layout/NativeStatusBar";
import { NetworkStatus } from "@/components/layout/NetworkStatus";
import appCss from "../styles.css?url";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" },
      { name: "theme-color", content: "#0a0815" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "hnChat" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "HN-Chat — دردشة ذكاء اصطناعي وشبكة تواصل اجتماعي" },
      { name: "description", content: "HN-Chat أفضل منصة دردشة ذكاء اصطناعي عربية. بوتات دردشة ذكية، تواصل اجتماعي، فيديو، تسوق، ومراسلة في تطبيق واحد. جرّب أقوى AI Chat مجاناً." },
      { name: "keywords", content: "دردشة ذكاء اصطناعي, AI Chat, HN-Chat, أفضل بوتات الدردشة, شات ذكي, تواصل اجتماعي, شبكة اجتماعية عربية, chatbot عربي, super app" },
      { name: "author", content: "hnChat" },
      { name: "robots", content: "index, follow" },
      { name: "google-site-verification", content: "334BDyhs3KGF40Y5XDt2OMoQOM9HLurOS-W1BnERuM0" },
      { property: "og:site_name", content: "hnChat" },
      { property: "og:title", content: "HN-Chat — دردشة ذكاء اصطناعي وشبكة تواصل اجتماعي" },
      { property: "og:description", content: "أفضل منصة دردشة ذكاء اصطناعي عربية. بوتات دردشة ذكية، تواصل اجتماعي، فيديو، تسوق في تطبيق واحد." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.hn-chat.com" },
      { property: "og:locale", content: "ar_AR" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:image", content: "https://www.hn-chat.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "hnChat — Super social app" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "HN-Chat — دردشة ذكاء اصطناعي وشبكة تواصل اجتماعي" },
      { name: "twitter:description", content: "أفضل منصة دردشة ذكاء اصطناعي عربية. بوتات ذكية، تواصل اجتماعي، فيديو، تسوق في تطبيق واحد." },
      { name: "twitter:image", content: "https://www.hn-chat.com/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      { rel: "canonical", href: "https://www.hn-chat.com" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.hn-chat.com/#org",
              name: "hnChat",
              url: "https://www.hn-chat.com",
              logo: "https://www.hn-chat.com/icon-512.png",
              sameAs: [
                "https://www.hn-chat.com",
                "https://twitter.com/hnchat",
                "https://facebook.com/hnchat",
                "https://instagram.com/hnchat",
              ],
            },
            {
              "@type": "WebApplication",
              name: "hnChat",
              url: "https://www.hn-chat.com",
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "Any",
              description: "منصة سوبر آب تجمع التواصل الاجتماعي، الفيديو، التسوق، والمراسلة في مكان واحد",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              publisher: { "@id": "https://www.hn-chat.com/#org" },
            },
            {
              "@type": "WebSite",
              url: "https://www.hn-chat.com",
              name: "hnChat",
              inLanguage: "ar",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.hn-chat.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        <HeadContent />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QPQ40Z8H14" />
      </head>
      <body className="dark">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function GaPageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-QPQ40Z8H14", {
        page_path: location.pathname,
      });
    }
  }, [location.pathname]);
  return null;
}

function RootComponent() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ScriptOnce children={`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-QPQ40Z8H14');`} />
        <GaPageViewTracker />
        <NativeStatusBar />
        <NetworkStatus />
        <NavigationProgress />
        <ExternalLinkGuard />
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
