import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Settings as SettingsIcon, User, Globe, LogOut, Shield, Moon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, isAdmin, roles, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-glow/30 to-violet-glow/20 border border-cyan-glow/40 flex items-center justify-center">
          <SettingsIcon className="h-6 w-6 text-cyan-glow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-sm text-muted-foreground">إدارة حسابك وتفضيلاتك العامة.</p>
        </div>
      </header>

      <section className="rounded-xl border border-ice-border bg-ice-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
          <User className="h-4 w-4 text-cyan-glow" /> الحساب
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">البريد الإلكتروني</dt>
            <dd className="font-medium">{user?.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">الدور</dt>
            <dd className="font-medium flex items-center gap-1">
              {isAdmin && <Shield className="h-3 w-3 text-pink-glow" />}
              {isAdmin ? "Admin" : roles[0] ?? "user"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-ice-border bg-ice-card p-5 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Moon className="h-4 w-4 text-violet-glow" /> المظهر
        </h2>
        <p className="text-xs text-muted-foreground">التطبيق يستخدم وضعاً داكناً afقاً مع تدرّجات Cyan/Violet.</p>
      </section>

      <section className="rounded-xl border border-ice-border bg-ice-card p-5 space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Globe className="h-4 w-4 text-cyan-glow" /> اللغة
        </h2>
        <p className="text-xs text-muted-foreground">العربية (افتراضي) — مزيد من اللغات قريباً.</p>
      </section>

      <button
        onClick={async () => { await signOut(); navigate({ to: "/sign-up-login" }); }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium"
      >
        <LogOut className="h-4 w-4" /> تسجيل الخروج
      </button>
    </div>
  );
}
