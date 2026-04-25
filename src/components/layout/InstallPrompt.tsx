import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "hn:install-dismissed";

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Already installed (running standalone) — don't show
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS standalone
      (window.navigator as any).standalone === true;
    if (standalone) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      setShowIos(true);
      setHidden(false);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  };

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    dismiss();
  };

  return (
    <div
      className="md:hidden fixed left-3 right-3 z-50 bg-ice-card border border-ice-border rounded-2xl p-3 shadow-glass backdrop-blur-xl flex items-center gap-3"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 4rem)" }}
    >
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center">
        <Download className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">ثبّت hnChat على هاتفك</p>
        <p className="text-[11px] text-muted-foreground leading-snug">
          {showIos
            ? "اضغط زر المشاركة ثم \"إضافة إلى الشاشة الرئيسية\""
            : "تجربة كاملة الشاشة وأسرع، مع أيقونة على الشاشة الرئيسية."}
        </p>
      </div>
      {showIos ? (
        <Share className="h-5 w-5 text-cyan-glow shrink-0" />
      ) : (
        <Button size="sm" onClick={install} className="shrink-0 h-8">
          تثبيت
        </Button>
      )}
      <button
        onClick={dismiss}
        aria-label="إغلاق"
        className="h-7 w-7 rounded-full hover:bg-white/5 flex items-center justify-center text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
