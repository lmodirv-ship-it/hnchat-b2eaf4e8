import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { HnLogo } from "@/components/HnLogo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/sign-up-login")({
  component: AuthPage,
});


function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isOwner, isAdmin, rolesLoaded } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  // Store UTM params for analytics
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get("utm_source");
    const utm_medium = params.get("utm_medium");
    const utm_campaign = params.get("utm_campaign");
    if (utm_source) {
      sessionStorage.setItem("utm_source", utm_source);
      if (utm_medium) sessionStorage.setItem("utm_medium", utm_medium);
      if (utm_campaign) sessionStorage.setItem("utm_campaign", utm_campaign);
    }
  }, []);

  async function handleGoogleSignIn() {
    setBusy("google");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message || "Google sign-in failed");
      if (result.redirected) return;
      toast.success("مرحباً بك!");
    } catch (e: any) {
      toast.error(e.message ?? "Google sign-in failed");
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated && rolesLoaded) {
      if (isOwner) {
        navigate({ to: "/owner-x9k2m7" });
      } else if (isAdmin) {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/feed" });
      }
    }
  }, [isAuthenticated, isLoading, isOwner, isAdmin, rolesLoaded, navigate]);


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
          <HnLogo size={56} showText={true} subtitle="hn-chat.com" />
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
            {mode === "login" && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="h-4 w-4 rounded border-border accent-primary" />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">تذكرني</Label>
              </div>
            )}
            <Button
              type="submit"
              disabled={busy === "form"}
              className="w-full bg-gradient-to-r from-cyan-glow to-violet-glow hover:opacity-90 text-primary-foreground font-semibold shadow-[0_0_24px_oklch(0.78_0.18_220/0.4)]"
            >
              {busy === "form" ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">أو</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={busy !== null}
            variant="outline"
            className="w-full gap-3 h-11 text-sm font-medium border-ice-border hover:bg-muted/40"
          >
            {busy === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            المتابعة مع Google
          </Button>

        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to our <Link to="/sign-up-login" className="underline">Terms</Link>
        </p>
      </div>
    </div>
  );
}
