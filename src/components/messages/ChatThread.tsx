import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Send, ShieldCheck, Smile, Paperclip, Users, Sparkles, ArrowDown, X, Image as ImageIcon } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { UserProfileDialog } from "@/components/profile/UserProfileDialog";

interface Attachment {
  url: string;
  type: string;
  name: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  attachments?: Attachment[];
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

function ImagePreview({ url, name }: { url: string; name: string }) {
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <>
      <img
        src={url}
        alt={name}
        className="max-w-[240px] max-h-[200px] rounded-lg cursor-pointer hover:opacity-90 transition object-cover"
        loading="lazy"
        onClick={() => setFullscreen(true)}
      />
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}
        >
          <img src={url} alt={name} className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </>
  );
}

export function ChatThread({ conversationId, compact = false }: { conversationId: string; compact?: boolean }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Record<string, MemberProfile>>({});
  const [groupName, setGroupName] = useState<string | null>(null);
  const [isGroup, setIsGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setMessages((data || []) as unknown as Message[]);
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
            haptic("light");
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("يرجى اختيار صورة");
      return;
    }
    if (imageFiles.some((f) => f.size > 10 * 1024 * 1024)) {
      toast.error("الحد الأقصى لحجم الصورة 10MB");
      return;
    }
    setPendingFiles((prev) => [...prev, ...imageFiles].slice(0, 5));
    e.target.value = "";
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadFiles(): Promise<Attachment[]> {
    if (!user || pendingFiles.length === 0) return [];
    setUploading(true);
    const attachments: Attachment[] = [];
    try {
      for (const file of pendingFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("chat-attachments")
          .upload(path, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from("chat-attachments")
          .getPublicUrl(path);
        attachments.push({
          url: urlData.publicUrl,
          type: file.type,
          name: file.name,
        });
      }
    } catch (err: any) {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
    return attachments;
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    if (!user || sending) return;
    if (!text.trim() && pendingFiles.length === 0) return;
    setSending(true);
    haptic("light");
    const content = text.trim();
    setText("");
    setShowEmojis(false);

    let attachments: Attachment[] = [];
    if (pendingFiles.length > 0) {
      attachments = await uploadFiles();
      setPendingFiles([]);
    }

    const insertData: any = {
      conversation_id: conversationId,
      sender_id: user.id,
      content: content || (attachments.length > 0 ? "📷 صورة" : ""),
    };
    if (attachments.length > 0) {
      insertData.attachments = attachments;
    }

    const { error } = await supabase.from("messages").insert(insertData);
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
    <Card className={cn(
      "relative overflow-hidden bg-gradient-to-b from-card via-card to-background/40 border-border flex flex-col shadow-lg",
      compact ? "h-full" : "h-[calc(100vh-180px)] min-h-[520px]"
    )}>
      {/* Header */}
      <div className="relative flex items-center gap-3 p-4 border-b border-border/70 backdrop-blur-xl bg-card/60">
        <Link to={otherUser ? "/user/$userId" : "#"} params={otherUser ? { userId: otherUser.id } : undefined as any} className="relative">
          <Avatar className="h-11 w-11 ring-2 ring-primary/40 ring-offset-2 ring-offset-card">
            <AvatarImage src={otherUser?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {isGroup ? <Users className="h-5 w-5" /> : headerTitle.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isGroup && otherUser?.is_online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-card animate-pulse" />
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Link to={otherUser ? "/user/$userId" : "#"} params={otherUser ? { userId: otherUser.id } : undefined as any} className="font-semibold truncate text-base hover:text-primary transition-colors">{headerTitle}</Link>
            {otherUser?.is_verified && <ShieldCheck className="h-4 w-4 text-primary shrink-0" />}
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
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 ring-1 ring-primary/30">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">ابدأ المحادثة بإرسال أول رسالة 👋</p>
          </div>
        ) : (
          grouped.map((day) => (
            <div key={day.date} className="space-y-3">
              <div className="flex items-center justify-center sticky top-0 z-10">
                <div className="px-3 py-1 rounded-full text-[11px] font-medium bg-background/80 backdrop-blur-md border border-border text-muted-foreground">
                  {day.label}
                </div>
              </div>

              {day.groups.map((group, gi) => {
                const mine = group.senderId === user?.id;
                const sender = members[group.senderId];
                return (
                  <div key={gi} className={cn("flex gap-2", mine ? "justify-end" : "justify-start")}>
                    {!mine && (
                      <Link to="/profile/$username" params={{ username: members[group.senderId]?.username ?? group.senderId }}>
                        <Avatar className="h-8 w-8 mt-auto shrink-0 ring-1 ring-border hover:ring-primary/50 transition-all">
                          <AvatarImage src={sender?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                            {(sender?.username || "??").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    )}
                    <div className={cn("flex flex-col gap-0.5 max-w-[75%]", mine ? "items-end" : "items-start")}>
                      {!mine && isGroup && (
                        <Link to="/profile/$username" params={{ username: members[group.senderId]?.username ?? group.senderId }} className="text-[11px] font-medium text-primary/90 px-1 hover:text-primary transition-colors">
                          {sender?.full_name || sender?.username || "عضو"}
                        </Link>
                      )}
                      {group.items.map((m, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === group.items.length - 1;
                        const attachments = (m.attachments || []) as Attachment[];
                        return (
                          <div
                            key={m.id}
                            className={cn(
                              "group/msg relative px-4 py-2 text-sm break-words backdrop-blur-sm transition-all",
                              "border shadow-sm hover:shadow-md",
                              mine
                                ? "bg-primary/15 border-primary/30 text-foreground"
                                : "bg-background/70 border-border text-foreground",
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
                            {/* Image attachments */}
                            {attachments.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-1">
                                {attachments.map((att, ai) => (
                                  att.type.startsWith("image/") ? (
                                    <ImagePreview key={ai} url={att.url} name={att.name} />
                                  ) : (
                                    <a key={ai} href={att.url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline">{att.name}</a>
                                  )
                                ))}
                              </div>
                            )}
                            {m.content && m.content !== "📷 صورة" && (
                              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                            )}
                            {m.content === "📷 صورة" && attachments.length === 0 && (
                              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                            )}
                            <div className="flex items-center gap-1 justify-end mt-0.5 opacity-70">
                              <span className="text-[10px]">{format(new Date(m.created_at), "HH:mm")}</span>
                              {mine && (
                                <span className={cn("text-[10px]", m.read_at ? "text-primary" : "text-muted-foreground")}>
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
            <div className="flex gap-1 px-3 py-2 rounded-2xl bg-background/70 border border-border w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
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
          className="absolute bottom-24 right-4 z-20 h-10 w-10 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/50 backdrop-blur-md flex items-center justify-center text-primary shadow-lg transition-all"
          aria-label="انتقل للأسفل"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Pending files preview */}
      {pendingFiles.length > 0 && (
        <div className="px-3 pt-2 flex gap-2 overflow-x-auto border-t border-border bg-card/60">
          {pendingFiles.map((f, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0">
              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
              <button
                onClick={() => removePendingFile(i)}
                className="absolute top-0 right-0 p-0.5 bg-black/60 rounded-bl-lg text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji bar */}
      {showEmojis && (
        <div className="px-3 pt-2 flex flex-wrap gap-1.5 border-t border-border bg-card/60 backdrop-blur-xl">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setText((t) => t + e);
                inputRef.current?.focus();
              }}
              className="h-9 w-9 rounded-lg hover:bg-primary/15 text-xl transition-all hover:scale-110"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="relative p-3 border-t border-border/70 backdrop-blur-xl bg-card/60 flex items-end gap-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setShowEmojis((v) => !v)}
          className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <Smile className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-10 w-10 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالة..."
          disabled={sending || uploading}
          rows={1}
          className="flex-1 resize-none max-h-32 min-h-[40px] rounded-2xl bg-background/70 border border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/20 px-4 py-2 text-sm outline-none transition-all"
        />
        <Button
          type="submit"
          size="icon"
          disabled={(!text.trim() && pendingFiles.length === 0) || sending || uploading}
          className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 shadow-lg"
        >
          {sending || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </Card>
  );
}
