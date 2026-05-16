import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * Small floating side reminder for unregistered visitors.
 * Anonymous (guest) users and signed-out visitors see it; real accounts don't.
 * Fully optional — user can dismiss it and keep browsing all pages.
 */
export function GuestRegisterReminder() {
  const { user, isLoading } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("guest_reminder_dismissed") === "1") setDismissed(true);
  }, []);

  if (isLoading || dismissed) return null;
  // Treat anonymous Supabase users as "non-registered"
  const isAnon = !user || (user as any).is_anonymous === true || !user.email;
  if (!isAnon) return null;

  const close = () => {
    setDismissed(true);
    try { sessionStorage.setItem("guest_reminder_dismissed", "1"); } catch {}
  };

  const signupHref = `/auth?mode=signup${name ? `&name=${encodeURIComponent(name)}` : ""}${email ? `&email=${encodeURIComponent(email)}` : ""}`;

  return (
    <aside
      dir="rtl"
      className="fixed bottom-4 left-4 z-[60] w-[230px] rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
    >
      <button
        onClick={close}
        aria-label="إغلاق"
        className="absolute top-1.5 left-1.5 rounded-md p-1 text-white/50 hover:text-white hover:bg-white/10 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-center gap-1.5 mb-2">
        <UserPlus className="h-3.5 w-3.5 text-cyan-400" />
        <p className="text-[11px] font-semibold text-white/90">سجّل ليُحفظ حسابك</p>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="الاسم"
        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 mb-1.5"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="البريد الإلكتروني"
        className="w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400/50 mb-2"
      />
      <Link
        to={"/auth" as any}
        search={{ mode: "signup" } as any}
        onClick={() => {
          try {
            if (name) sessionStorage.setItem("prefill_name", name);
            if (email) sessionStorage.setItem("prefill_email", email);
          } catch {}
        }}
        className="block w-full text-center rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition"
      >
        تسجيل (اختياري)
      </Link>
      <p className="mt-1.5 text-[10px] text-white/40 text-center">يمكنك المتابعة بدون تسجيل</p>
    </aside>
  );
}
