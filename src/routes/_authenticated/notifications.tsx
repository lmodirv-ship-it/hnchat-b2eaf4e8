import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Mail, Sparkles, CheckCheck, Check } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type NotifType = Database["public"]["Enums"]["notification_type"];
type Tab = "all" | "unread" | "read";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: NotificationsPage,
});

const ICON: Record<NotifType, { icon: typeof Heart; tone: string }> = {
  like:    { icon: Heart,         tone: "text-pink-glow bg-pink-glow/10 border-pink-glow/30" },
  comment: { icon: MessageCircle, tone: "text-cyan-glow bg-cyan-glow/10 border-cyan-glow/30" },
  follow:  { icon: UserPlus,      tone: "text-violet-glow bg-violet-glow/10 border-violet-glow/30" },
  mention: { icon: AtSign,        tone: "text-cyan-glow bg-cyan-glow/10 border-cyan-glow/30" },
  message: { icon: Mail,          tone: "text-violet-glow bg-violet-glow/10 border-violet-glow/30" },
  system:  { icon: Sparkles,      tone: "text-foreground bg-muted/40 border-ice-border" },
};

const LABEL: Record<NotifType, string> = {
  like: "أعجب بمنشورك",
  comment: "علّق على منشورك",
  follow: "بدأ بمتابعتك",
  mention: "أشار إليك",
  message: "أرسل لك رسالة",
  system: "إشعار من النظام",
};

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}ث`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}د`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}س`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}ي`;
  return new Date(iso).toLocaleDateString("ar");
}

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("all");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as NotificationRow[];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications", user.id] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, qc]);

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications")
        .update({ is_read: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", user?.id] });
      toast.success("تم تعليم الكل كمقروء");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  const filtered = useMemo(() => {
    if (tab === "unread") return notifications.filter((n) => !n.is_read);
    if (tab === "read") return notifications.filter((n) => n.is_read);
    return notifications;
  }, [notifications, tab]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all",    label: "الكل",      count: notifications.length },
    { key: "unread", label: "غير مقروء", count: unreadCount },
    { key: "read",   label: "مقروء",     count: notifications.length - unreadCount },
  ];

  return (
    <PageShell
      title="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "كل شيء مقروء"}
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAll.mutate()}
          disabled={unreadCount === 0 || markAll.isPending}
          className="gap-1.5"
        >
          <CheckCheck className="h-4 w-4" /> تعليم الكل كمقروء
        </Button>
      }
    >
      <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-ice-card border border-ice-border w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
              tab === t.key
                ? "bg-gradient-to-r from-cyan-glow/20 to-violet-glow/15 text-foreground shadow-[inset_0_0_0_1px_oklch(0.78_0.18_220/0.4)]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50">{t.count}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-ice-card border border-ice-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 bg-ice-card border-ice-border text-center">
          <Bell className="h-10 w-10 mx-auto mb-3 text-cyan-glow" />
          <p className="text-muted-foreground">
            {tab === "unread" ? "لا توجد إشعارات غير مقروءة" :
             tab === "read"   ? "لا توجد إشعارات مقروءة" :
                                "لا توجد إشعارات بعد"}
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {filtered.map((n) => {
            const meta = ICON[n.type];
            const Icon = meta.icon;
            const inner = (
              <div className={`relative flex items-start gap-3 p-3 rounded-xl border transition-all ${
                n.is_read
                  ? "bg-ice-card/60 border-ice-border"
                  : "bg-gradient-to-r from-cyan-glow/[0.06] to-violet-glow/[0.04] border-cyan-glow/30"
              }`}>
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{LABEL[n.type]}</span>
                    {n.content && <span className="text-muted-foreground"> — {n.content}</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(n.created_at)}</div>
                </div>
                {!n.is_read && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); markOne.mutate(n.id); }}
                    className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-cyan-glow hover:bg-cyan-glow/10 transition-colors"
                    title="تعليم كمقروء"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {!n.is_read && (
                  <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-cyan-glow shadow-[0_0_8px_oklch(0.78_0.18_220)]" />
                )}
              </div>
            );
            return (
              <li key={n.id}>
                {n.link ? (
                  <a
                    href={n.link}
                    onClick={() => { if (!n.is_read) markOne.mutate(n.id); }}
                    className="block"
                  >
                    {inner}
                  </a>
                ) : inner}
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
