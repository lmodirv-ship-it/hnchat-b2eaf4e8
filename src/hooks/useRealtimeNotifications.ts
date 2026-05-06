/**
 * useRealtimeNotifications — Global notification counter + instant updates.
 * Subscribes to notifications table for the current user.
 * Provides unread count for badges across the app.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";

interface NotificationPayload {
  id: string;
  type: string;
  content: string | null;
  is_read: boolean;
  created_at: string;
}

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    if (!error && count !== null) setUnreadCount(count);
  }, [user?.id]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notif-live-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as NotificationPayload;
          setUnreadCount((c) => c + 1);
          qc.invalidateQueries({ queryKey: ["notifications", user.id] });

          // Show toast for new notification
          if (n.content) {
            toast(n.content, {
              icon: "🔔",
              duration: 4000,
              className: "bg-[oklch(0.08_0.02_260)] border-[oklch(0.78_0.18_220/0.3)] text-[oklch(0.9_0.03_250)]",
            });
          }
          haptic("light");
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Re-fetch count on mark-as-read
          fetchUnreadCount();
          qc.invalidateQueries({ queryKey: ["notifications", user.id] });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc, fetchUnreadCount]);

  const markAllRead = useCallback(async () => {
    if (!user?.id) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setUnreadCount(0);
  }, [user?.id]);

  return { unreadCount, markAllRead, refetchCount: fetchUnreadCount };
}
