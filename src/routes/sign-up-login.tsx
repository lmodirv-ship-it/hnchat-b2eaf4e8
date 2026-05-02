import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { HnLogo } from "@/components/HnLogo";
import { toast } from "sonner";
import { Sparkles, ShoppingBag, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/sign-up-login")({
  component: AuthPage,
});

const DEMOS = [
  { label: "Creator", email: "creator@hnchat.demo", password: "Creator!2025", icon: Sparkles, color: "from-cyan-glow to-primary-glow" },
  { label: "Shopper", email: "shopper@hnchat.demo", password: "Shopper!2025", icon: ShoppingBag, color: "from-violet-glow to-pink-glow" },
  { label: "Admin",   email: "admin@hnchat.demo",   password: "Admin!2025",   icon: ShieldCheck, color: "from-pink-glow to-cyan-glow" },
];

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isOwner, isAdmin } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isOwner) {
        navigate({ to: "/owner-x9k2m7" });
      } else if (isAdmin) {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/feed" });
      }
    }
  }, [isAuthenticated, isLoading, isOwner, isAdmin, navigate]);

  async function ensureDemo(em: string, pw: string, uname: string) {
    // Try sign in; if fails, sign up then sign in
    let { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    if (error) {
      const { error: suErr } = await supabase.auth.signUp({
        email: em, password: pw,
        options: {
          emailRedirectTo: `${window.location.origin}/feed`,
          data: { username: uname, full_name: uname },
        },
      });
      if (suErr && !suErr.message.includes("already")) throw suErr;
      const r = await supabase.auth.signInWithPassword({ email: em, password: pw });
      if (r.error) throw r.error;
    }
  }

  async function handleDemo(d: typeof DEMOS[number]) {
    setBusy(d.label);
    try {
      await ensureDemo(d.email, d.password, d.label.toLowerCase());
      if (d.label === "Admin") {
        // Promote to admin role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("user_roles").upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
        }
      } else if (d.label === "Creator") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from("user_roles").upsert({ user_id: user.id, role: "creator" }, { onConflict: "user_id,role" });
      } else if (d.label === "Shopper") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from("user_roles").upsert({ user_id: user.id, role: "shopper" }, { onConflict: "user_id,role" });
      }
      toast.success(`Welcome, ${d.label}!`);
      navigate({ to: d.label === "Admin" ? "/admin" : "/feed" });
    } catch (e: any) {
      toast.error(e.message ?? "Demo login failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy("form");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/feed`,
            data: { username: username || email.split("@")[0], full_name: username || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account");
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        // Redirect will be handled by useEffect after roles load
      }
    } catch (e: any) {
      toast.error(e.message ?? "Authentication failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Ambient diamond glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-glow/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-violet-glow/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-pink-glow/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <HnLogo className="h-14 w-14 mb-3" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-glow via-foreground to-violet-glow bg-clip-text text-transparent">
            hnChat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your World. One App.</p>
        </div>

        <Card className="p-6 backdrop-blur-2xl bg-ice-card border-ice-border shadow-[0_0_40px_oklch(0.78_0.18_220/0.15)]">
          <div className="flex gap-2 mb-6 p-1 rounded-lg bg-muted/40">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === m
                    ? "bg-gradient-to-r from-cyan-glow/30 to-violet-glow/30 text-foreground shadow-[0_0_16px_oklch(0.78_0.18_220/0.4)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="diamond_user" className="mt-1.5 bg-input/50" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@hnchat.net" className="mt-1.5 bg-input/50" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 bg-input/50" />
            </div>
            <Button
              type="submit"
              disabled={busy === "form"}
              className="w-full bg-gradient-to-r from-cyan-glow to-violet-glow hover:opacity-90 text-primary-foreground font-semibold shadow-[0_0_24px_oklch(0.78_0.18_220/0.4)]"
            >
              {busy === "form" ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or try a demo</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMOS.map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.label}
                  onClick={() => handleDemo(d)}
                  disabled={busy !== null}
                  className={`group relative p-3 rounded-lg border border-ice-border bg-gradient-to-br ${d.color} bg-opacity-10 hover:scale-[1.03] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="absolute inset-0 rounded-lg bg-background/60" />
                  <div className="relative flex flex-col items-center gap-1.5">
                    {busy === d.label ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                    <span className="text-xs font-medium">{d.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to our <Link to="/sign-up-login" className="underline">Terms</Link>
        </p>
      </div>
    </div>
  );
}
