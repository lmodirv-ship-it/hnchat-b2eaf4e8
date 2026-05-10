import { type ReactNode, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { HnLogo } from "@/components/HnLogo";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { Palette, Type, MousePointerClick } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PublicPageShell({
  children,
  dir = "rtl",
  headerActions,
}: {
  children: ReactNode;
  dir?: "rtl" | "ltr";
  headerActions?: ReactNode;
}) {
  const { bgColor, textColor, btnColor, setBg, setText, setBtn } = useThemeColors();
  const bgRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [guestBusy, setGuestBusy] = useState(false);

  async function handleGuestEntry() {
    if (guestBusy) return;
    setGuestBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { navigate({ to: "/feed" }); return; }
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      toast.success("مرحباً بك! تم منحك معرفاً مؤقتاً");
      navigate({ to: "/feed" });
    } catch (e: any) {
      toast.error(e?.message || "تعذر الدخول كزائر");
    } finally {
      setGuestBusy(false);
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden text-foreground"
      dir={dir}
      style={{
        ...(bgColor ? { '--theme-bg': bgColor, backgroundColor: bgColor } : {}),
        ...(textColor ? { '--theme-text': textColor, color: textColor } : {}),
        ...(btnColor ? { '--theme-btn': btnColor } : {}),
      } as React.CSSProperties}
    >
      {/* ═══ Vivid purple/violet cosmic background ═══ */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Base gradient — deep purple/indigo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(145deg, oklch(0.12 0.06 285) 0%, oklch(0.08 0.05 270) 30%, oklch(0.10 0.07 295) 60%, oklch(0.07 0.04 260) 100%)",
          }}
        />

        {/* Large violet orb — top left */}
        <div
          className="absolute -top-20 -left-20 h-[600px] w-[600px] rounded-full blur-[160px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.45 0.22 295 / 0.5) 0%, oklch(0.35 0.18 280 / 0.2) 40%, transparent 70%)",
            animation: "meshFloat1 25s ease-in-out infinite",
          }}
        />

        {/* Cyan/teal orb — right side */}
        <div
          className="absolute top-1/4 -right-16 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.18 220 / 0.35) 0%, oklch(0.5 0.15 240 / 0.15) 40%, transparent 70%)",
            animation: "meshFloat2 30s ease-in-out infinite",
          }}
        />

        {/* Purple/pink orb — bottom center */}
        <div
          className="absolute -bottom-16 left-1/3 h-[500px] w-[500px] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.40 0.20 310 / 0.4) 0%, oklch(0.30 0.15 290 / 0.15) 40%, transparent 70%)",
            animation: "meshFloat3 22s ease-in-out infinite",
          }}
        />

        {/* Extra indigo glow — center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full blur-[200px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.30 0.12 275 / 0.3) 0%, transparent 60%)",
          }}
        />

        {/* Neural grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
          <defs>
            <pattern id="pub-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="oklch(0.65 0.25 295)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pub-grid)" />
        </svg>

        {/* Soft vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 0%, oklch(0.06 0.04 272 / 0.5) 100%)",
          }}
        />
      </div>

      <FloatingParticles />

      {/* ═══ Header ═══ */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl border-b border-violet-glow/10" style={{ background: "oklch(0.10 0.05 280 / 0.7)" }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/feed" className="flex items-center gap-2 group">
              <HnLogo className="h-6 w-6" />
              <span className="text-sm font-bold bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
                hnChat
              </span>
            </Link>
            {headerActions}
          </div>

          <div className="flex items-center gap-2">
            {/* Color buttons */}
            <button onClick={() => bgRef.current?.click()} className="p-1.5 rounded-lg hover:bg-white/10 transition relative" title="لون الخلفية">
              <Palette className="h-4 w-4 text-muted-foreground/60" />
              {bgColor && <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white/30" style={{ backgroundColor: bgColor }} />}
            </button>
            <input ref={bgRef} type="color" value={bgColor || "#0a0a1a"} onChange={(e) => setBg(e.target.value)} className="sr-only" />

            <button onClick={() => textRef.current?.click()} className="p-1.5 rounded-lg hover:bg-white/10 transition relative" title="لون الكتابة">
              <Type className="h-4 w-4 text-muted-foreground/60" />
              {textColor && <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white/30" style={{ backgroundColor: textColor }} />}
            </button>
            <input ref={textRef} type="color" value={textColor || "#e0e0ee"} onChange={(e) => setText(e.target.value)} className="sr-only" />

            <button onClick={() => btnRef.current?.click()} className="p-1.5 rounded-lg hover:bg-white/10 transition relative" title="لون الأزرار">
              <MousePointerClick className="h-4 w-4 text-muted-foreground/60" />
              {btnColor && <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white/30" style={{ backgroundColor: btnColor }} />}
            </button>
            <input ref={btnRef} type="color" value={btnColor || "#5ec4ff"} onChange={(e) => setBtn(e.target.value)} className="sr-only" />

            <span className="hidden sm:block w-px h-4 bg-white/10" />
            <Link to="/about" className="hidden sm:inline text-xs text-muted-foreground/60 hover:text-foreground transition-colors">حول</Link>
            <Link to="/blog" className="hidden sm:inline text-xs text-muted-foreground/60 hover:text-foreground transition-colors">Blog</Link>
            <Link to="/contact" className="hidden sm:inline text-xs text-muted-foreground/60 hover:text-foreground transition-colors">تواصل</Link>
            <button
              onClick={handleGuestEntry}
              disabled={guestBusy}
              className="px-5 py-2 text-xs font-semibold rounded-full text-white transition-all hover:shadow-[0_0_20px_oklch(0.65_0.25_295/0.4)] hover:scale-105 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.25 295) 0%, oklch(0.55 0.20 270) 50%, oklch(0.78 0.18 220) 100%)" }}
            >
              {guestBusy ? "..." : "ابدأ مجاناً"}
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Content ═══ */}
      <main className="relative z-10">{children}</main>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 py-10 px-6">
        <div className="max-w-3xl mx-auto mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-violet-glow/30 to-transparent" />
        </div>
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            <HnLogo className="h-5 w-5 opacity-70" />
            <span className="text-xs font-semibold bg-gradient-to-r from-cyan-glow/70 to-violet-glow/70 bg-clip-text text-transparent">hnChat</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground/50 flex-wrap justify-center">
            <Link to="/about" className="hover:text-violet-glow transition-colors">حول</Link>
            <Link to="/blog" className="hover:text-violet-glow transition-colors">Blog</Link>
            <Link to="/contact" className="hover:text-violet-glow transition-colors">تواصل</Link>
            <Link to="/privacy" className="hover:text-violet-glow transition-colors">الخصوصية</Link>
            <Link to="/terms" className="hover:text-violet-glow transition-colors">الشروط</Link>
            <Link to="/community-guidelines" className="hover:text-violet-glow transition-colors">إرشادات المجتمع</Link>
          </div>
          <p className="text-[11px] text-muted-foreground/30 text-center tracking-wide">
            جميع الحقوق محفوظة لمجموعة HN © 2024 - تصميم مولاي إسماعيل الحسني
          </p>
        </div>
      </footer>
    </div>
  );
}
