import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, roles, isAdmin } = useAuth();
  return (
    <PageShell title="Profile">
      <Card className="p-6 bg-ice-card border-ice-border">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-[0_0_24px_oklch(0.78_0.18_220/0.4)]">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold">{user?.email}</div>
            <div className="flex gap-2 mt-2">
              {isAdmin && <Badge className="bg-pink-glow/20 text-pink-glow border-pink-glow/40">Admin</Badge>}
              {roles.filter(r => r !== "admin").map(r => (
                <Badge key={r} variant="outline">{r}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
