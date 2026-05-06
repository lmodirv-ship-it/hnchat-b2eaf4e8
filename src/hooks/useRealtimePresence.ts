/**
 * useRealtimePresence — Global presence system for hnChat.
 * Tracks online/offline + broadcasts user presence via Supabase Realtime.
 * Updates profiles.is_online and profiles.last_seen.
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const HEARTBEAT_MS = 30_000; // 30s heartbeat
const OFFLINE_TIMEOUT_MS = 60_000; // consider offline after 60s

interface PresenceUser {
  userId: string;
  username?: string;
  avatarUrl?: string;
  onlineAt: string;
}

export function useRealtimePresence() {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, PresenceUser>>(new Map());

  const updatePresence = useCallback(async (online: boolean) => {
    if (!user?.id) return;
    await supabase
      .from("profiles")
      .update({ is_online: online, last_seen: new Date().toISOString() })
      .eq("id", user.id);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    // Join global presence channel
    const channel = supabase.channel("hn-presence", {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        const map = new Map<string, PresenceUser>();
        for (const [key, entries] of Object.entries(state)) {
          if (entries?.[0]) map.set(key, entries[0]);
        }
        setOnlineUsers(map);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId: user.id,
            onlineAt: new Date().toISOString(),
          });
          updatePresence(true);
        }
      });

    channelRef.current = channel;

    // Heartbeat to keep presence fresh
    heartbeatRef.current = setInterval(() => {
      updatePresence(true);
    }, HEARTBEAT_MS);

    // Go offline on tab close/hide
    const handleVisibility = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        updatePresence(true);
        channel.track({ userId: user.id, onlineAt: new Date().toISOString() });
      }
    };

    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      updatePresence(false);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user?.id, updatePresence]);

  const isOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  return { onlineUsers, onlineCount: onlineUsers.size, isOnline };
}
