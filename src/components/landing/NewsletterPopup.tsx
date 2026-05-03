import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("newsletter_dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setShow(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim(), source: "popup" });
      if (error) {
        if (error.code === "23505") {
          toast.info("أنت مشترك بالفعل! 🎉");
        } else {
          throw error;
        }
      } else {
        toast.success("تم الاشتراك بنجاح! 🎉");
      }
      setSubmitted(true);
      setTimeout(() => { setShow(false); sessionStorage.setItem("newsletter_dismissed", "1"); }, 2000);
    } catch {
      toast.error("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("newsletter_dismissed", "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm rounded-2xl border border-cyan-glow/20 bg-background/95 backdrop-blur-xl shadow-2xl shadow-cyan-glow/10 overflow-hidden">
              {/* Glow decoration */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-b from-cyan-glow/20 to-transparent rounded-full blur-3xl -translate-y-1/2" />

              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-ice-card/50 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative p-6 text-center">
                {!submitted ? (
                  <>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 border border-cyan-glow/30 mb-4">
                      <Mail className="w-7 h-7 text-cyan-glow" />
                    </div>
                    <h3 className="text-lg font-extrabold mb-1">
                      لا تفوت <span className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">الجديد</span>
                    </h3>
                    <p className="text-xs text-muted-foreground/70 mb-5 leading-relaxed">
                      اشترك في نشرتنا البريدية للحصول على آخر التحديثات والميزات الجديدة والعروض الحصرية
                    </p>
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        dir="ltr"
                        className="flex-1 rounded-lg bg-ice-card/40 border border-ice-border/20 px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-cyan-glow/50 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-glow to-violet-glow text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-glow/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {loading ? "..." : "اشترك"}
                      </button>
                    </form>
                    <p className="mt-3 text-[10px] text-muted-foreground/30">
                      لن نشارك بريدك مع أي طرف ثالث
                    </p>
                  </>
                ) : (
                  <div className="py-4">
                    <div className="text-4xl mb-3">🎉</div>
                    <h3 className="text-lg font-bold text-cyan-glow">شكراً لك!</h3>
                    <p className="text-xs text-muted-foreground/60 mt-1">تم تسجيلك بنجاح في نشرتنا البريدية</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
