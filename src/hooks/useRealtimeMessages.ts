/**
 * useRealtimeMessages — Global unread message counter.
 * Subscribes to messages table for unread count badge.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useRealtimeMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!user?.id) return;
    // Get conversations user is in, then count unread messages
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
    
    if (!parts?.length) { setUnreadCount(0); return; }
    
    const convIds = parts.map((p) => p.conversation_id);
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .neq("sender_id", user.id)
      .is("read_at", null);
    
    setUnreadCount(count ?? 0);
  }, [user?.id]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`msg-count-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as { sender_id: string };
          if (msg.sender_id !== user.id) {
            setUnreadCount((c) => c + 1);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => {
          // read_at updated — refetch
          fetchUnread();
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchUnread]);

  return { unreadCount, refetch: fetchUnread };
}
