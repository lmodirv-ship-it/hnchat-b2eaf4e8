import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getDefaultAvatar } from "@/lib/default-avatar";
import { friendlyName } from "@/lib/display-name";
import {
  Send, Globe, Users, UserPlus, Check, X, Circle, MessageCircle, Paperclip, ImageIcon, Loader2, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserProfileDialog } from "@/components/profile/UserProfileDialog";

/* ── video URL detection ── */
type VideoEmbed =
  | { kind: "youtube"; id: string; url: string }
  | { kind: "video"; url: string };

function detectVideo(text: string | null | undefined): VideoEmbed | null {
  if (!text) return null;
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  if (!urlMatch) return null;
  const url = urlMatch[0];
  // YouTube
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt) return { kind: "youtube", id: yt[1], url };
  // Direct video file
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) {
    return { kind: "video", url };
  }
  return null;
}

const RETENTION_HOURS = 28;

export const Route = createFileRoute("/_authenticated/public-chat")({
  component: PublicChatPage,
});

/* ── types ── */
interface ChatMsg {
  id: string;
  user_id: string;
  content: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
  created_at: string;
  profile?: { username: string; avatar_url: string | null; full_name: string | null };
}

interface OnlineUser {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  is_online: boolean;
  last_seen: string | null;
}

interface Invitation {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: { username: string; avatar_url: string | null };
}

/* ── main component ── */
function PublicChatPage() {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  /* ── load messages ── */
  const loadMessages = useCallback(async () => {
    const since = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000).toISOString();
    const { data: rows } = await supabase
      .from("public_chat_messages")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(200);
    if (rows) {
      const data = [...rows].reverse();
      // load profiles for messages
      const userIds = [...new Set(data.map((m) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, full_name")
        .in("id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
      setMessages(
        data.map((m) => ({
          ...m,
          profile: profileMap.get(m.user_id) as ChatMsg["profile"],
        })),
      );
    }
  }, []);

  /* ── load online users ── */
  const loadOnlineUsers = useCallback(async () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, full_name, is_online, last_seen")
      .or(`is_online.eq.true,last_seen.gte.${fiveMinAgo}`)
      .limit(50);
    if (data) setOnlineUsers(data);
  }, []);

  /* ── load invitations ── */
  const loadInvitations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_invitations")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (data) {
      const senderIds = data.map((i) => i.sender_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", senderIds);
      const pm = new Map(profiles?.map((p) => [p.id, p]) ?? []);
      setInvitations(
        data.map((inv) => ({
          ...inv,
          sender: pm.get(inv.sender_id) as Invitation["sender"],
        })),
      );
    }
  }, [user]);

  /* ── initial load ── */
  useEffect(() => {
    loadMessages();
    loadOnlineUsers();
    loadInvitations();
    // refresh online users every 30s
    const interval = setInterval(loadOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, [loadMessages, loadOnlineUsers, loadInvitations]);

  /* ── realtime subscriptions ── */
  useEffect(() => {
    const channel = supabase
      .channel("public-chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "public_chat_messages" },
        async (payload) => {
          const msg = payload.new as ChatMsg;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, full_name")
            .eq("id", msg.user_id)
            .single();
          setMessages((prev) => [
            ...prev,
            { ...msg, profile: profile as ChatMsg["profile"] },
          ]);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "public_chat_messages" },
        (payload) => {
          const old = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== old.id));
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_invitations" },
        () => {
          loadInvitations();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_invitations" },
        () => {
          loadInvitations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadInvitations]);

  /* ── auto-scroll ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* ── update presence ── */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq("id", user.id)
      .then(() => {});

    const interval = setInterval(() => {
      supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", user.id)
        .then(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  /* ── send message ── */
  const handleSend = async () => {
    if (!newMsg.trim() || !user || sending) return;
    setSending(true);
    const content = newMsg.trim();
    setNewMsg("");
    const { error } = await supabase
      .from("public_chat_messages")
      .insert({ user_id: user.id, content });
    if (error) toast.error("فشل إرسال الرسالة");
    setSending(false);
    inputRef.current?.focus();
  };

  /* ── upload attachment ── */
  const handleFileUpload = async (file: File, kind: "image" | "file") => {
    if (!user || uploading) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("الحجم الأقصى 10 ميجابايت");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/public-chat/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("chat-attachments")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("chat-attachments").getPublicUrl(path);
      const { error } = await supabase.from("public_chat_messages").insert({
        user_id: user.id,
        content: kind === "image" ? "" : file.name,
        attachment_url: pub.publicUrl,
        attachment_type: kind === "image" ? "image" : "file",
      });
      if (error) throw error;
    } catch (e) {
      console.error(e);
      toast.error("فشل رفع الملف");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  /* ── send invitation ── */
  const sendInvite = async (receiverId: string) => {
    if (!user) return;
    if (receiverId === user.id) return;
    const { error } = await supabase.from("chat_invitations").insert({
      sender_id: user.id,
      receiver_id: receiverId,
    });
    if (error) {
      toast.error("فشل إرسال الدعوة");
    } else {
      toast.success("تم إرسال الدعوة");
    }
  };

  /* ── respond to invitation ── */
  const respondInvite = async (id: string, accept: boolean) => {
    const status = accept ? "accepted" : "declined";
    await supabase
      .from("chat_invitations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (accept) toast.success("تم قبول الدعوة");
    loadInvitations();
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-full overflow-hidden" dir="rtl">
      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Invitations bar */}
        {invitations.length > 0 && (
          <div className="shrink-0 px-4 py-2 border-b border-[oklch(1_0_0/0.07)] bg-[oklch(0.14_0.04_260/0.5)]">
            <p className="text-xs font-semibold text-[oklch(0.70_0.15_220)] mb-1.5">
              دعوات واردة ({invitations.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-2 bg-[oklch(0.18_0.03_255/0.8)] rounded-lg px-3 py-1.5 border border-[oklch(1_0_0/0.08)]"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={inv.sender?.avatar_url || getDefaultAvatar(inv.sender_id)} />
                    <AvatarFallback className="text-[8px] bg-[oklch(0.25_0.06_230)]">
                      {inv.sender?.username?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-white">
                    {inv.sender?.username}
                  </span>
                  <button
                    onClick={() => respondInvite(inv.id, true)}
                    className="p-1 rounded hover:bg-green-500/20 text-green-400 transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => respondInvite(inv.id, false)}
                    className="p-1 rounded hover:bg-red-500/20 text-red-400 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-2.5 sm:px-4 py-2.5 space-y-1 scrollbar-thin bg-gradient-to-b from-[oklch(0.08_0.02_258)] to-[oklch(0.07_0.02_258)]"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-[oklch(0.30_0.05_250)] mb-3" />
              <p className="text-sm text-[oklch(0.45_0.02_250)]">
                لا توجد رسائل بعد. كن أول من يكتب!
              </p>
            </div>
          )}
          {messages.map((msg, idx) => {
            const isMe = msg.user_id === user?.id;
            const prev = messages[idx - 1];
            const grouped =
              prev &&
              prev.user_id === msg.user_id &&
              new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60 * 1000;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2 max-w-[86%] sm:max-w-[78%]",
                  isMe ? "mr-auto flex-row-reverse" : "ml-auto",
                  grouped ? "mt-0.5" : "mt-2.5",
                )}
              >
                <div className="w-7 sm:w-8 shrink-0">
                  {!grouped && (
                    <button type="button" onClick={() => setProfileUserId(msg.user_id)}>
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mt-0.5 ring-1 ring-[oklch(1_0_0/0.06)] hover:ring-[oklch(0.50_0.15_220)] transition">
                        <AvatarImage src={msg.profile?.avatar_url || getDefaultAvatar(msg.user_id)} />
                        <AvatarFallback className="text-[10px] bg-gradient-to-br from-[oklch(0.28_0.08_230)] to-[oklch(0.22_0.06_245)] text-white">
                          {msg.profile?.username?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  )}
                </div>
                <div className="min-w-0 flex flex-col">
                  {/* Name + time row removed — show only avatar + message bubble */}
                  <div
                    className={cn(
                      "text-[13px] leading-snug break-words overflow-hidden",
                      msg.attachment_type === "image" && !msg.content
                        ? "p-1 rounded-2xl bg-[oklch(0.14_0.02_258)] border border-[oklch(1_0_0/0.05)]"
                        : "px-3 py-1.5 rounded-2xl",
                      isMe
                        ? cn(
                            "bg-gradient-to-br from-[oklch(0.46_0.16_220)] to-[oklch(0.36_0.14_235)] text-white shadow-[0_2px_10px_oklch(0.40_0.15_220/0.25)]",
                            grouped ? "rounded-br-md rounded-tr-md" : "rounded-br-sm",
                          )
                        : cn(
                            "bg-[oklch(0.155_0.02_258)] text-[oklch(0.92_0.005_250)] border border-[oklch(1_0_0/0.05)]",
                            grouped ? "rounded-bl-md rounded-tl-md" : "rounded-bl-sm",
                          ),
                    )}
                  >
                    {msg.attachment_type === "image" && msg.attachment_url && (
                      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={msg.attachment_url}
                          alt="attachment"
                          className="rounded-xl max-h-64 w-auto object-cover"
                          loading="lazy"
                        />
                      </a>
                    )}
                    {msg.attachment_type === "file" && msg.attachment_url && (
                      <a
                        href={msg.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 underline-offset-2 hover:underline"
                      >
                        <Paperclip className="h-4 w-4" />
                        <span className="truncate">{msg.content || "ملف"}</span>
                      </a>
                    )}
                    {msg.attachment_type !== "file" && msg.content && (
                      <div className={cn(msg.attachment_url && "mt-1.5 px-1")}>{msg.content}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-[oklch(1_0_0/0.07)] bg-[oklch(0.11_0.02_258/0.95)] backdrop-blur-md mb-16 md:mb-0 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-1.5"
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f, "image");
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f, "file");
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={uploading}
              onClick={() => imageInputRef.current?.click()}
              className="rounded-full h-10 w-10 shrink-0 text-[oklch(0.65_0.12_220)] hover:bg-[oklch(0.20_0.06_230/0.5)]"
              title="إرسال صورة"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full h-10 w-10 shrink-0 text-[oklch(0.65_0.12_220)] hover:bg-[oklch(0.20_0.06_230/0.5)]"
              title="إرسال ملف"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              ref={inputRef}
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="اكتب رسالة للجميع..."
              className="flex-1 bg-[oklch(0.14_0.02_258)] border-[oklch(1_0_0/0.08)] text-white placeholder:text-[oklch(0.40_0.02_250)] text-[13px] rounded-full h-10 px-4"
              maxLength={500}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMsg.trim() || sending}
              className="bg-gradient-to-br from-[oklch(0.42_0.16_220)] to-[oklch(0.36_0.14_230)] hover:opacity-90 text-white rounded-full h-10 w-10 shrink-0 shadow-lg shadow-[oklch(0.40_0.15_220/0.3)]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* ── Online users — left column (avatars only) ── */}
      <div className="flex flex-col w-[64px] shrink-0 border-l border-[oklch(1_0_0/0.07)] bg-[oklch(0.09_0.02_258)] overflow-y-auto py-2 gap-2 items-center scrollbar-thin">
        {onlineUsers.map((u) => (
          <button
            key={u.id}
            onClick={() => setProfileUserId(u.id)}
            className="relative shrink-0"
            title={friendlyName(u.full_name, u.username, u.id)}
          >
            <Avatar className="h-10 w-10 ring-2 ring-[oklch(0.30_0.12_220/0.4)] hover:ring-[oklch(0.50_0.15_220)] transition">
              <AvatarImage src={u.avatar_url || getDefaultAvatar(u.id)} />
              <AvatarFallback className="text-[10px] bg-[oklch(0.25_0.06_230)] text-white">
                {u.username?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <Circle className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 fill-green-500 text-green-500" />
          </button>
        ))}
      </div>

      <UserProfileDialog
        userId={profileUserId}
        open={!!profileUserId}
        onOpenChange={(o) => !o && setProfileUserId(null)}
      />
    </div>
  );
}
