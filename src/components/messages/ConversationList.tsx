import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ConversationItem {
  id: string;
  is_group: boolean;
  name: string | null;
  last_message_at: string;
  other_user?: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unread_count?: number;
}

export function ConversationList({ activeId, onSelect }: { activeId?: string; onSelect?: (id: string) => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);

    // Get conversation IDs the user participates in
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    const convIds = (parts || []).map((p) => p.conversation_id);
    if (convIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: convs } = await supabase
      .from("conversations")
      .select("id, is_group, name, last_message_at")
      .in("id", convIds)
      .order("last_message_at", { ascending: false });

    if (!convs) {
      setItems([]);
      setLoading(false);
      return;
    }

    // Fetch other participants for DMs
    const { data: allParts } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds);

    const otherIds = Array.from(
      new Set(
        (allParts || [])
          .filter((p) => p.user_id !== user.id)
          .map((p) => p.user_id),
      ),
    );

    const { data: profiles } = otherIds.length
      ? await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, is_verified")
          .in("id", otherIds)
      : { data: [] };

    const profMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Last message per conversation
    const { data: lastMsgs } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at, sender_id")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });

    const lastMap = new Map<string, ConversationItem["last_message"]>();
    (lastMsgs || []).forEach((m) => {
      if (!lastMap.has(m.conversation_id)) {
        lastMap.set(m.conversation_id, {
          content: m.content,
          created_at: m.created_at,
          sender_id: m.sender_id,
        });
      }
    });

    const enriched: ConversationItem[] = convs.map((c) => {
      const others = (allParts || []).filter(
        (p) => p.conversation_id === c.id && p.user_id !== user.id,
      );
      const otherProf = others[0] ? profMap.get(others[0].user_id) : null;
      return {
        ...c,
        other_user: otherProf || undefined,
        last_message: lastMap.get(c.id) || null,
      };
    });

    setItems(enriched);
    setLoading(false);
  }

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel("conv-list-" + user.id)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversation_participants", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-glow" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-12 bg-ice-card border-ice-border text-center">
        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-cyan-glow" />
        <p className="text-muted-foreground">لا توجد محادثات بعد. ابدأ محادثة جديدة!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((c) => {
        const title = c.is_group
          ? c.name || "Group"
          : c.other_user?.full_name || c.other_user?.username || "User";
        const avatar = c.other_user?.avatar_url || undefined;
        const initial = title.slice(0, 2).toUpperCase();
        const inner = (
          <>
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">{title}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(c.last_message_at), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {c.last_message?.content || "لا توجد رسائل بعد"}
              </p>
            </div>
          </>
        );
        const cls = cn(
          "flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-card/70 transition cursor-pointer",
          activeId === c.id && "ring-1 ring-primary/60 bg-primary/5",
        );
        if (onSelect) {
          return (
            <button key={c.id} onClick={() => onSelect(c.id)} className={cn(cls, "w-full text-right")}>
              {inner}
            </button>
          );
        }
        return (
          <Link key={c.id} to="/messages/$conversationId" params={{ conversationId: c.id }} className={cls}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
