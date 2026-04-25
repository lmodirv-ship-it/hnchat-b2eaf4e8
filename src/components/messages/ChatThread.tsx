import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Send, ShieldCheck, Smile, Paperclip, Users, Sparkles, ArrowDown } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface MemberProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_online?: boolean;
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🔥", "🎉", "👏", "🙏", "✨"];

function formatDayLabel(date: Date) {
  if (isToday(date)) return "اليوم";
  if (isYesterday(date)) return "أمس";
  return format(date, "EEEE, dd MMM");
}

export function ChatThread({ conversationId }: { conversationId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Record<string, MemberProfile>>({});
  const [groupName, setGroupName] = useState<string | null>(null);
  const [isGroup, setIsGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const otherUser = useMemo(() => {
    if (isGroup || !user) return null;
    return Object.values(members).find((m) => m.id !== user.id) || null;
  }, [members, isGroup, user]);

  async function loadHeaderAndMembers() {
    if (!user) return;
    const { data: conv } = await supabase
      .from("conversations")
      .select("id, is_group, name")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv) return;
    setIsGroup(conv.is_group);
    setGroupName(conv.name);

    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId);
    const ids = (parts || []).map((p) => p.user_id);
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, is_verified, is_online")
        .in("id", ids);
      const map: Record<string, MemberProfile> = {};
      (profs || []).forEach((p) => {
        map[p.id] = p as MemberProfile;
      });
      setMembers(map);
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
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "auto" }), 50);
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
    loadHeaderAndMembers();
    loadMessages().then(() => markRead());

    const dbChannel = supabase
      .channel("chat-db-" + conversationId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
          if (user && m.sender_id !== user.id) {
            markRead();
            triggerHaptic("light");
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
        },
      )
      .subscribe();

    // Typing presence channel
    const typingChannel = supabase.channel("chat-typing-" + conversationId, {
      config: { presence: { key: user?.id || "anon" } },
    });
    typingChannel
      .on("broadcast", { event: "typing" }, (payload) => {
        const senderId = (payload.payload as { user_id: string }).user_id;
        if (!user || senderId === user.id) return;
        setTypingUsers((prev) => (prev.includes(senderId) ? prev : [...prev, senderId]));
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== senderId));
        }, 3000);
      })
      .subscribe();
    typingChannelRef.current = typingChannel;

    return () => {
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(typingChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.id]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJump(dist > 200);
  }

  function broadcastTyping() {
    if (!user || !typingChannelRef.current) return;
    typingChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user.id },
    });
  }

  function onTextChange(v: string) {
    setText(v);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(broadcastTyping, 250);
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    if (!user || !text.trim() || sending) return;
    setSending(true);
    triggerHaptic("light");
    const content = text.trim();
    setText("");
    setShowEmojis(false);
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
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by day, then by consecutive sender
  const grouped = useMemo(() => {
    const days: Array<{ label: string; date: string; groups: Array<{ senderId: string; items: Message[] }> }> = [];
    let currentDay: (typeof days)[number] | null = null;
    let currentGroup: { senderId: string; items: Message[] } | null = null;
    for (const m of messages) {
      const d = new Date(m.created_at);
      const dayKey = format(d, "yyyy-MM-dd");
      if (!currentDay || currentDay.date !== dayKey) {
        currentDay = { label: formatDayLabel(d), date: dayKey, groups: [] };
        days.push(currentDay);
        currentGroup = null;
      }
      if (!currentGroup || currentGroup.senderId !== m.sender_id) {
        currentGroup = { senderId: m.sender_id, items: [] };
        currentDay.groups.push(currentGroup);
      }
      currentGroup.items.push(m);
    }
    return days;
  }, [messages]);

  const headerTitle = isGroup
    ? groupName || "محادثة جماعية"
    : otherUser?.full_name || otherUser?.username || "محادثة";

  const memberCount = Object.keys(members).length;
  const onlineCount = Object.values(members).filter((m) => m.is_online).length;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-b from-ice-card via-ice-card to-ice-bg/40 border-ice-border flex flex-col h-[calc(100vh-180px)] min-h-[520px] shadow-[0_0_60px_-15px_rgba(34,211,238,0.25)]">
      {/* Decorative aura */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-cyan-glow/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center gap-3 p-4 border-b border-ice-border/70 backdrop-blur-xl bg-ice-card/60">
        <div className="relative">
          <Avatar className="h-11 w-11 ring-2 ring-cyan-glow/40 ring-offset-2 ring-offset-ice-card">
            <AvatarImage src={otherUser?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-glow/30 to-violet-500/30 text-cyan-glow font-bold">
              {isGroup ? <Users className="h-5 w-5" /> : headerTitle.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isGroup && otherUser?.is_online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ice-card animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold truncate text-base">{headerTitle}</p>
            {otherUser?.is_verified && <ShieldCheck className="h-4 w-4 text-cyan-glow shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
            {isGroup ? (
              <>
                <Users className="h-3 w-3" />
                {memberCount} عضو
                {onlineCount > 0 && (
                  <span className="text-emerald-400">• {onlineCount} متصل</span>
                )}
              </>
            ) : otherUser ? (
              <>
                @{otherUser.username}
                {otherUser.is_online && <span className="text-emerald-400">• متصل الآن</span>}
              </>
            ) : null}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-4 scroll-smooth"
      >
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-glow" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-glow/20 to-violet-500/20 flex items-center justify-center mb-3 ring-1 ring-cyan-glow/30">
              <Sparkles className="h-7 w-7 text-cyan-glow" />
            </div>
            <p className="text-sm text-muted-foreground">ابدأ المحادثة بإرسال أول رسالة 👋</p>
          </div>
        ) : (
          grouped.map((day) => (
            <div key={day.date} className="space-y-3">
              {/* Day separator */}
              <div className="flex items-center justify-center sticky top-0 z-10">
                <div className="px-3 py-1 rounded-full text-[11px] font-medium bg-ice-bg/80 backdrop-blur-md border border-ice-border text-muted-foreground">
                  {day.label}
                </div>
              </div>

              {day.groups.map((group, gi) => {
                const mine = group.senderId === user?.id;
                const sender = members[group.senderId];
                return (
                  <div key={gi} className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}>
                    {!mine && (
                      <Avatar className="h-8 w-8 mt-auto shrink-0 ring-1 ring-ice-border">
                        <AvatarImage src={sender?.avatar_url || undefined} />
                        <AvatarFallback className="bg-cyan-glow/10 text-cyan-glow text-[10px]">
                          {(sender?.username || "??").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("flex flex-col gap-0.5 max-w-[75%]", mine ? "items-end" : "items-start")}>
                      {!mine && isGroup && (
                        <span className="text-[11px] font-medium text-cyan-glow/90 px-1">
                          {sender?.full_name || sender?.username || "عضو"}
                        </span>
                      )}
                      {group.items.map((m, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === group.items.length - 1;
                        return (
                          <div
                            key={m.id}
                            className={cn(
                              "group/msg relative px-4 py-2 text-sm break-words backdrop-blur-sm transition-all",
                              "border shadow-sm hover:shadow-md",
                              mine
                                ? "bg-gradient-to-br from-cyan-glow/25 to-cyan-glow/10 border-cyan-glow/40 text-foreground"
                                : "bg-ice-bg/70 border-ice-border text-foreground",
                              // Bubble corners depending on grouping
                              mine
                                ? cn(
                                    "rounded-2xl rounded-br-md",
                                    isFirst && "rounded-tr-2xl",
                                    !isFirst && "rounded-tr-md",
                                    isLast && "rounded-br-sm",
                                  )
                                : cn(
                                    "rounded-2xl rounded-bl-md",
                                    isFirst && "rounded-tl-2xl",
                                    !isFirst && "rounded-tl-md",
                                    isLast && "rounded-bl-sm",
                                  ),
                            )}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                            <div className="flex items-center gap-1 justify-end mt-0.5 opacity-70">
                              <span className="text-[10px]">{format(new Date(m.created_at), "HH:mm")}</span>
                              {mine && (
                                <span className={cn("text-[10px]", m.read_at ? "text-cyan-glow" : "text-muted-foreground")}>
                                  {m.read_at ? "✓✓" : "✓"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <div className="flex gap-1 px-3 py-2 rounded-2xl bg-ice-bg/70 border border-ice-border w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {typingUsers.length === 1
                ? `${members[typingUsers[0]]?.username || "شخص ما"} يكتب...`
                : `${typingUsers.length} أشخاص يكتبون...`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Jump to bottom */}
      {showJump && (
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-24 right-4 z-20 h-10 w-10 rounded-full bg-cyan-glow/20 hover:bg-cyan-glow/30 border border-cyan-glow/50 backdrop-blur-md flex items-center justify-center text-cyan-glow shadow-lg transition-all"
          aria-label="انتقل للأسفل"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Emoji bar */}
      {showEmojis && (
        <div className="px-3 pt-2 flex flex-wrap gap-1.5 border-t border-ice-border bg-ice-card/60 backdrop-blur-xl">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setText((t) => t + e);
                inputRef.current?.focus();
              }}
              className="h-9 w-9 rounded-lg hover:bg-cyan-glow/15 text-xl transition-all hover:scale-110"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="relative p-3 border-t border-ice-border/70 backdrop-blur-xl bg-ice-card/60 flex items-end gap-2"
      >
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setShowEmojis((v) => !v)}
          className="h-10 w-10 shrink-0 text-muted-foreground hover:text-cyan-glow hover:bg-cyan-glow/10"
        >
          <Smile className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-10 w-10 shrink-0 text-muted-foreground hover:text-cyan-glow hover:bg-cyan-glow/10"
          onClick={() => toast.info("سيتم دعم المرفقات قريبًا")}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالة..."
          disabled={sending}
          rows={1}
          className="flex-1 resize-none max-h-32 min-h-[40px] rounded-2xl bg-ice-bg/70 border border-ice-border focus:border-cyan-glow/60 focus:ring-2 focus:ring-cyan-glow/20 px-4 py-2 text-sm outline-none transition-all"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || sending}
          className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-cyan-glow to-violet-500 text-white hover:opacity-90 disabled:opacity-40 shadow-[0_0_20px_-2px_rgba(34,211,238,0.6)]"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </Card>
  );
}
