import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Settings, User, Bell, Lock, Globe, Palette } from "lucide-react";

const SECTIONS = [
  { icon: User, label: "الحساب والملف الشخصي", to: "/profile", color: "text-cyan-glow", bg: "bg-cyan-glow/15" },
  { icon: Bell, label: "الإشعارات", to: "/notifications", color: "text-violet-glow", bg: "bg-violet-glow/15" },
  { icon: Lock, label: "الخصوصية والأمان", to: "/preferences", color: "text-pink-glow", bg: "bg-pink-glow/15" },
  { icon: Globe, label: "اللغة والمنطقة", to: "/preferences", color: "text-yellow-400", bg: "bg-yellow-400/15" },
  { icon: Palette, label: "المظهر", to: "/preferences", color: "text-green-400", bg: "bg-green-400/15" },
  { icon: Settings, label: "متقدّم", to: "/preferences", color: "text-muted-foreground", bg: "bg-muted/30" },
] as const;

export const Route = createFileRoute("/_authenticated/preferences")({
  component: () => (
    <PageShell title="Preferences" subtitle="إعدادات حسابك وتفضيلات استخدامك">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTIONS.map((s, i) => (
          <Link
            key={i}
            to={s.to}
            className="flex items-center gap-3 p-4 rounded-xl bg-ice-card border border-ice-border hover:border-cyan-glow/40 transition-colors"
          >
            <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <span className="text-sm font-medium">{s.label}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  ),
});
