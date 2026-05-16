import { useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

type Variant = "side" | "bottom";

/**
 * Inline "register reminder" block for unregistered visitors.
 * - variant="side": vertical card, fits in a sidebar / aside slot
 * - variant="bottom": wider horizontal card, sits at bottom of feed
 * Hides automatically when the user is signed in with a real account.
 */
export function GuestRegisterReminder({ variant = "bottom" }: { variant?: Variant }) {
  const { user, isLoading } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("guest_reminder_dismissed") === "1") setDismissed(true);
  }, []);

  if (isLoading || dismissed) return null;
  // Anonymous Supabase users (no email) and signed-out visitors -> show
  const isAnon = !user || (user as any).is_anonymous === true || !user.email;
  if (!isAnon) return null;

  const handleSignupClick = () => {
    try {
      if (name) sessionStorage.setItem("prefill_name", name);
      if (email) sessionStorage.setItem("prefill_email", email);
    } catch {}
  };

  const handleGoogle = async () => {
    if (googleBusy) return;
    setGoogleBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("تعذّر تسجيل الدخول عبر Google");
        setGoogleBusy(false);
        return;
      }
      if (result.redirected) return; // browser navigates away
      window.location.reload();
    } catch {
      toast.error("تعذّر تسجيل الدخول عبر Google");
      setGoogleBusy(false);
    }
  };

  const signupHref = `/sign-up-login${email ? `?email=${encodeURIComponent(email)}` : ""}`;

  const isSide = variant === "side";

  return (
    <aside
      dir="rtl"
      className={
        isSide
          ? "relative w-full rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "relative w-full max-w-3xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-violet-950/40 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
      }
    >
      <button
        onClick={() => {
          setDismissed(true);
          try { sessionStorage.setItem("guest_reminder_dismissed", "1"); } catch {}
        }}
        aria-label="إغلاق"
        className="absolute top-2 left-2 rounded-md p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className={isSide ? "flex items-center gap-2 mb-3" : "flex items-center gap-2 mb-4 justify-center"}>
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-[0_4px_20px_oklch(0.65_0.2_220/0.4)]">
          <UserPlus className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className={isSide ? "text-sm font-bold text-white" : "text-base font-bold text-white"}>
            سجّل ليُحفظ حسابك
          </p>
          {!isSide && (
            <p className="text-xs text-white/50">تابع تفاعلك ومنشوراتك من أي جهاز</p>
          )}
        </div>
      </div>

      <div className={isSide ? "space-y-2" : "grid sm:grid-cols-2 gap-3"}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="الاسم"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="البريد الإلكتروني"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50"
        />
      </div>

      <a
        href={signupHref}
        onClick={handleSignupClick}
        className="mt-3 block w-full text-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition shadow-[0_8px_24px_oklch(0.55_0.2_280/0.4)]"
      >
        تسجيل (اختياري)
      </a>

      <button
        onClick={handleGoogle}
        disabled={googleBusy}
        className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2.5 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.46.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.96l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
        </svg>
        {googleBusy ? "جاري التحويل..." : "متابعة باستخدام Google"}
      </button>

      <p className="mt-2 text-[11px] text-white/40 text-center">يمكنك المتابعة بدون تسجيل</p>
    </aside>
  );
}
