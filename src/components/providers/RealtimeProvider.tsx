/**
 * RealtimeProvider — Central realtime context for hnChat.
 * Combines presence, notifications, messages, and feed into one provider.
 */
import { createContext, useContext, type ReactNode } from "react";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";

interface RealtimeContextValue {
  // Presence
  onlineCount: number;
  isOnline: (userId: string) => boolean;
  // Notifications
  notifUnread: number;
  markAllNotifsRead: () => Promise<void>;
  // Messages
  msgUnread: number;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  onlineCount: 0,
  isOnline: () => false,
  notifUnread: 0,
  markAllNotifsRead: async () => {},
  msgUnread: 0,
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { onlineCount, isOnline } = useRealtimePresence();
  const { unreadCount: notifUnread, markAllRead: markAllNotifsRead } = useRealtimeNotifications();
  const { unreadCount: msgUnread } = useRealtimeMessages();

  return (
    <RealtimeContext.Provider
      value={{
        onlineCount,
        isOnline,
        notifUnread,
        markAllNotifsRead,
        msgUnread,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
