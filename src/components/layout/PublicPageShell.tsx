import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { HnLogo } from "@/components/HnLogo";
import { FloatingParticles } from "@/components/landing/FloatingParticles";

export function PublicPageShell({
  children,
  dir = "rtl",
}: {
  children: ReactNode;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="min-h-screen relative overflow-hidden text-foreground" dir={dir}>
      {/* ═══ Cosmic atmospheric background ═══ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Deep cosmic orbs */}
        <div
          className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.78 0.18 220 / 0.18) 0%, transparent 70%)",
            animation: "meshFloat1 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/3 -right-24 h-[450px] w-[450px] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.25 295 / 0.16) 0%, transparent 70%)",
            animation: "meshFloat2 30s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-24 left-1/4 h-[400px] w-[400px] rounded-full blur-[130px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.2 270 / 0.12) 0%, transparent 70%)",
            animation: "meshFloat3 20s ease-in-out infinite",
          }}
        />

        {/* Neural grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern id="pub-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="oklch(0.78 0.18 220)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pub-grid)" />
        </svg>

        {/* Depth vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, oklch(0.06 0.04 272 / 0.6) 100%)",
          }}
        />
      </div>

      <FloatingParticles />

      {/* ═══ Header ═══ */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-ice-border/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <HnLogo className="h-6 w-6" />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
              hnChat
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className="hidden sm:inline text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              حول
            </Link>
            <Link
              to="/blog"
              className="hidden sm:inline text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/contact"
              className="hidden sm:inline text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              تواصل
            </Link>
            <Link
              to="/sign-up-login"
              className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow text-white hover:shadow-lg hover:shadow-cyan-glow/20 transition-all"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ Content ═══ */}
      <main className="relative z-10">{children}</main>

      {/* ═══ Footer — same as landing ═══ */}
      <footer className="relative z-10 py-10 px-6">
        <div className="max-w-3xl mx-auto mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-ice-border/30 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            <HnLogo className="h-5 w-5 opacity-70" />
            <span className="text-xs font-semibold bg-gradient-to-r from-cyan-glow/70 to-violet-glow/70 bg-clip-text text-transparent">
              hnChat
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground/50 flex-wrap justify-center">
            <Link to="/about" className="hover:text-foreground/70 transition-colors">حول</Link>
            <Link to="/blog" className="hover:text-foreground/70 transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-foreground/70 transition-colors">تواصل</Link>
            <Link to="/privacy" className="hover:text-foreground/70 transition-colors">الخصوصية</Link>
            <Link to="/terms" className="hover:text-foreground/70 transition-colors">الشروط</Link>
          </div>
          <p className="text-[11px] text-muted-foreground/30 text-center tracking-wide">
            جميع الحقوق محفوظة لمجموعة HN © 2024 - تصميم مولاي إسماعيل الحسني
          </p>
        </div>
      </footer>
    </div>
  );
}
