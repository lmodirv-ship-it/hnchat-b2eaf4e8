import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNewsletter } from "@/hooks/useNewsletter";

export function NewsletterSignup({
  source = "website",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const { subscribe, loading } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const ok = await subscribe(email.trim(), source);
    if (ok) setEmail("");
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
        <Input
          type="email"
          placeholder="بريدك الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-card/50 border-border/30 text-sm"
          required
          dir="ltr"
        />
        <Button type="submit" size="sm" disabled={loading} className="shrink-0">
          <Mail className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <div className="rounded-2xl border border-border/20 bg-card/40 backdrop-blur-sm p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">
        اشترك في نشرة hnChat
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        احصل على أحدث أخبار الذكاء الاصطناعي وأفضل الأدوات أسبوعيًا
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
        <Input
          type="email"
          placeholder="أدخل بريدك الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-background/50 border-border/30"
          required
          dir="ltr"
        />
        <Button type="submit" disabled={loading} className="shrink-0 gap-1">
          اشتراك
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
