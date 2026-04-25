import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface OtherUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export function ChatThread({ conversationId }: { conversationId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [other, setOther] = useState<OtherUser | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [isGroup, setIsGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadHeader() {
    if (!user) return;
    const { data: conv } = await supabase
      .from("conversations")
      .select("id, is_group, name")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv) return;
    setIsGroup(conv.is_group);
    setGroupName(conv.name);
    if (!conv.is_group) {
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId);
      const otherId = (parts || []).find((p) => p.user_id !== user.id)?.user_id;
      if (otherId) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, is_verified")
          .eq("id", otherId)
          .maybeSingle();
        if (prof) setOther(prof as OtherUser);
      }
    }
  }

  async function loadMessages() {
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages((data || []) as Message[]);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function markRead() {
    if (!user) return;
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .is("read_at", null);
  }

  useEffect(() => {
    loadHeader();
    loadMessages().then(() => markRead());

    const channel = supabase
      .channel("chat-" + conversationId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
          if (user && m.sender_id !== user.id) markRead();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.id]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!user || !text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    setText("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    });
    if (error) {
      toast.error("فشل الإرسال");
      setText(content);
    }
    setSending(false);
  }

  const headerTitle = isGroup
    ? groupName || "Group chat"
    : other?.full_name || other?.username || "Conversation";

  return (
    <Card className="bg-ice-card border-ice-border flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-ice-border">
        <Avatar className="h-10 w-10 border border-ice-border">
          <AvatarImage src={other?.avatar_url || undefined} />
          <AvatarFallback className="bg-cyan-glow/10 text-cyan-glow">
            {headerTitle.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold truncate">{headerTitle}</p>
            {other?.is_verified && (
              <ShieldCheck className="h-4 w-4 text-cyan-glow shrink-0" />
            )}
          </div>
          {other && (
            <p className="text-xs text-muted-foreground truncate">@{other.username}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-glow" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">
            ابدأ المحادثة بإرسال أول رسالة 👋
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm break-words",
                    mine
                      ? "bg-cyan-glow/20 text-foreground border border-cyan-glow/40"
                      : "bg-ice-border/40 text-foreground border border-ice-border",
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(m.created_at), "HH:mm")}
                    </span>
                    {mine && (
                      <span className="text-[10px] text-muted-foreground">
                        {m.read_at ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="p-3 border-t border-ice-border flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالة..."
          disabled={sending}
          className="bg-ice-bg border-ice-border"
        />
        <Button
          type="submit"
          disabled={!text.trim() || sending}
          className="bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </Card>
  );
}
