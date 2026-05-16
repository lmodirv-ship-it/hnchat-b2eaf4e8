import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Embedded newsletter signup, designed to sit inside a long article.
 * Keeps the same dark-glass aesthetic as the rest of the blog.
 */
export function InlineNewsletterCTA({ isRTL }: { isRTL: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error(isRTL ? "بريد إلكتروني غير صالح" : "Invalid email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers" as any)
        .insert({ email: value, source: "blog_inline" } as any);
      if (error && !`${error.message}`.toLowerCase().includes("duplicate")) {
        throw error;
      }
      setDone(true);
      toast.success(isRTL ? "تم الاشتراك! 🎉" : "Subscribed! 🎉");
    } catch (err: any) {
      toast.error(err?.message ?? (isRTL ? "حدث خطأ" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-12 relative overflow-hidden rounded-3xl border border-cyan-glow/20 bg-gradient-to-br from-[oklch(0.15_0.04_260)] via-[oklch(0.13_0.03_250)] to-[oklch(0.15_0.04_240)] p-7 sm:p-9">
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-glow/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-glow/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="shrink-0">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-glow/25 to-violet-glow/25 border border-cyan-glow/30 flex items-center justify-center">
            <Mail className="h-6 w-6 text-cyan-glow" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold leading-tight mb-1.5">
            {isRTL ? "هل أعجبك المقال؟" : "Enjoyed this article?"}
          </h3>
          <p className="text-sm text-muted-foreground/60 leading-relaxed">
            {isRTL
              ? "اشترك في نشرتنا الأسبوعية واحصل على أفضل المقالات مباشرة في بريدك."
              : "Join our weekly newsletter and get the best articles delivered to your inbox."}
          </p>
        </div>

        {done ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-glow shrink-0">
            <CheckCircle2 className="h-5 w-5" />
            {isRTL ? "تم الاشتراك" : "Subscribed"}
          </div>
        ) : (
          <form onSubmit={submit} className="flex gap-2 w-full sm:w-auto sm:min-w-[320px]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isRTL ? "بريدك الإلكتروني" : "your@email.com"}
              dir="ltr"
              className="flex-1 h-11 px-4 rounded-xl bg-[oklch(0.10_0.02_250)] border border-ice-border/15 text-sm outline-none focus:border-cyan-glow/40 transition placeholder:text-muted-foreground/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 h-11 rounded-xl bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground text-sm font-semibold shrink-0 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "..." : <Send className="h-4 w-4 inline" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
