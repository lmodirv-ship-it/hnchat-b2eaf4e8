import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Inbox, Send, FileEdit, Trash2, Star, AlertOctagon, Archive,
  Paperclip, Plus, Search, X, Reply, Forward, Loader2, Tag, Mail,
  CheckCheck, Circle, ChevronRight, Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/mail")({
  component: MailPage,
});

type Folder = "inbox" | "starred" | "sent" | "drafts" | "important" | "spam" | "trash";

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
};

type Attachment = { name: string; url: string; size: number; type: string };

type MailRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  recipient_id: string | null;
  cc_ids: string[];
  bcc_ids: string[];
  subject: string;
  body: string;
  attachments: Attachment[];
  is_draft: boolean;
  is_read: boolean;
  is_starred_by_sender: boolean;
  is_starred_by_recipient: boolean;
  is_important: boolean;
  trashed_by_sender: boolean;
  trashed_by_recipient: boolean;
  archived_by_sender: boolean;
  archived_by_recipient: boolean;
  spam_by_recipient: boolean;
  reply_to: string | null;
  sent_at: string | null;
  created_at: string;
};

const FOLDERS: { id: Folder; label: string; icon: any; color: string }[] = [
  { id: "inbox", label: "صندوق الوارد", icon: Inbox, color: "text-cyan-glow" },
  { id: "starred", label: "بنجمة", icon: Star, color: "text-yellow-400" },
  { id: "important", label: "مهم", icon: AlertOctagon, color: "text-orange-400" },
  { id: "sent", label: "المرسلة", icon: Send, color: "text-violet-glow" },
  { id: "drafts", label: "المسودات", icon: FileEdit, color: "text-blue-400" },
  { id: "spam", label: "غير مرغوب", icon: AlertOctagon, color: "text-red-400" },
  { id: "trash", label: "المهملات", icon: Trash2, color: "text-muted-foreground" },
];

function MailPage() {
  const { user } = useAuth();
  const [folder, setFolder] = useState<Folder>("inbox");
  const [items, setItems] = useState<MailRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MailRow | null>(null);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeInit, setComposeInit] = useState<Partial<MailRow> | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    let q = supabase
      .from("mail_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    switch (folder) {
      case "inbox":
        q = q.eq("recipient_id", user.id).eq("is_draft", false).eq("trashed_by_recipient", false).eq("spam_by_recipient", false).eq("archived_by_recipient", false);
        break;
      case "starred":
        q = q.or(`and(recipient_id.eq.${user.id},is_starred_by_recipient.eq.true),and(sender_id.eq.${user.id},is_starred_by_sender.eq.true)`);
        break;
      case "important":
        q = q.eq("recipient_id", user.id).eq("is_important", true);
        break;
      case "sent":
        q = q.eq("sender_id", user.id).eq("is_draft", false).eq("trashed_by_sender", false);
        break;
      case "drafts":
        q = q.eq("sender_id", user.id).eq("is_draft", true);
        break;
      case "spam":
        q = q.eq("recipient_id", user.id).eq("spam_by_recipient", true);
        break;
      case "trash":
        q = q.or(`and(sender_id.eq.${user.id},trashed_by_sender.eq.true),and(recipient_id.eq.${user.id},trashed_by_recipient.eq.true)`);
        break;
    }

    const { data, error } = await q;
    if (error) {
      toast.error(error.message);
      setItems([]);
    } else {
      const rows = (data || []) as unknown as MailRow[];
      setItems(rows);
      // Fetch profiles
      const ids = new Set<string>();
      rows.forEach((r) => {
        ids.add(r.sender_id);
        if (r.recipient_id) ids.add(r.recipient_id);
        r.cc_ids?.forEach((id) => ids.add(id));
      });
      if (ids.size) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,username,full_name,avatar_url")
          .in("id", Array.from(ids));
        const map: Record<string, Profile> = {};
        (profs || []).forEach((p: any) => (map[p.id] = p));
        setProfiles((prev) => ({ ...prev, ...map }));
      }
    }
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [folder, user?.id]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("mail_messages_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "mail_messages" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [user?.id, folder]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter((r) =>
      r.subject?.toLowerCase().includes(s) ||
      r.body?.toLowerCase().includes(s) ||
      profiles[r.sender_id]?.username?.toLowerCase().includes(s) ||
      profiles[r.sender_id]?.full_name?.toLowerCase().includes(s)
    );
  }, [items, search, profiles]);

  const inboxUnread = useMemo(
    () => items.filter((r) => folder === "inbox" && !r.is_read).length,
    [items, folder]
  );

  async function markRead(row: MailRow, read = true) {
    if (!user || row.sender_id === user.id) return;
    if (row.is_read === read) return;
    await supabase.from("mail_messages").update({ is_read: read, read_at: read ? new Date().toISOString() : null }).eq("id", row.id);
  }

  async function toggleStar(row: MailRow) {
    if (!user) return;
    const isRecipient = row.recipient_id === user.id;
    const patch = isRecipient
      ? { is_starred_by_recipient: !row.is_starred_by_recipient }
      : { is_starred_by_sender: !row.is_starred_by_sender };
    await supabase.from("mail_messages").update(patch).eq("id", row.id);
  }

  async function toggleImportant(row: MailRow) {
    await supabase.from("mail_messages").update({ is_important: !row.is_important }).eq("id", row.id);
  }

  async function moveToTrash(row: MailRow) {
    if (!user) return;
    const patch = row.sender_id === user.id
      ? { trashed_by_sender: true }
      : { trashed_by_recipient: true };
    await supabase.from("mail_messages").update(patch).eq("id", row.id);
    setSelected(null);
    toast.success("تم النقل إلى المهملات");
  }

  async function restoreFromTrash(row: MailRow) {
    if (!user) return;
    const patch = row.sender_id === user.id
      ? { trashed_by_sender: false }
      : { trashed_by_recipient: false };
    await supabase.from("mail_messages").update(patch).eq("id", row.id);
    toast.success("تمت الاستعادة");
  }

  async function deleteForever(row: MailRow) {
    if (!user) return;
    if (row.is_draft && row.sender_id === user.id) {
      await supabase.from("mail_messages").delete().eq("id", row.id);
      setSelected(null);
      toast.success("تم الحذف");
    } else {
      // soft-delete by trashing
      moveToTrash(row);
    }
  }

  async function markSpam(row: MailRow) {
    if (!user || row.recipient_id !== user.id) return;
    await supabase.from("mail_messages").update({ spam_by_recipient: true }).eq("id", row.id);
    setSelected(null);
    toast.success("تم وضعها كغير مرغوب فيها");
  }

  async function archive(row: MailRow) {
    if (!user) return;
    const patch = row.sender_id === user.id
      ? { archived_by_sender: true }
      : { archived_by_recipient: true };
    await supabase.from("mail_messages").update(patch).eq("id", row.id);
    setSelected(null);
    toast.success("تمت الأرشفة");
  }

  function openCompose(init?: Partial<MailRow>) {
    setComposeInit(init || null);
    setComposeOpen(true);
  }

  return (
    <PageShell
      title="📧 البريد"
      subtitle="صندوق بريد داخلي بكل الميزات"
      action={
        <Button
          onClick={() => openCompose()}
          className="bg-violet-glow/20 hover:bg-violet-glow/30 text-violet-glow border border-violet-glow/40"
        >
          <Plus className="h-4 w-4 mr-1" /> رسالة جديدة
        </Button>
      }
    >
      <div className="grid grid-cols-12 gap-3 h-[calc(100vh-180px)]">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-ice-card border border-ice-border rounded-lg p-2 overflow-y-auto">
          <nav className="space-y-1">
            {FOLDERS.map((f) => {
              const Icon = f.icon;
              const active = folder === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => { setFolder(f.id); setSelected(null); }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-right",
                    active ? "bg-violet-glow/15 text-violet-glow" : "hover:bg-ice-bg text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-violet-glow" : f.color)} />
                  <span className="flex-1">{f.label}</span>
                  {f.id === "inbox" && inboxUnread > 0 && (
                    <span className="text-[10px] bg-violet-glow text-white px-1.5 rounded-full">{inboxUnread}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* List */}
        <section className={cn(
          "col-span-12 md:col-span-9 lg:col-span-4 bg-ice-card border border-ice-border rounded-lg flex flex-col overflow-hidden",
          selected && "hidden md:flex"
        )}>
          <div className="p-2 border-b border-ice-border">
            <div className="relative">
              <Search className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث في البريد..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-ice-bg border-ice-border pr-8"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 text-sm">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
                لا توجد رسائل
              </div>
            ) : (
              filtered.map((row) => {
                const isUserSender = row.sender_id === user?.id;
                const otherId = isUserSender ? row.recipient_id : row.sender_id;
                const other = otherId ? profiles[otherId] : null;
                const isStarred = isUserSender ? row.is_starred_by_sender : row.is_starred_by_recipient;
                const unread = !isUserSender && !row.is_read && !row.is_draft;
                return (
                  <button
                    key={row.id}
                    onClick={() => { setSelected(row); markRead(row, true); }}
                    className={cn(
                      "w-full text-right p-3 border-b border-ice-border/50 hover:bg-ice-bg/50 transition-colors flex gap-2",
                      selected?.id === row.id && "bg-violet-glow/10",
                      unread && "bg-cyan-glow/5"
                    )}
                  >
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={other?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {(other?.full_name || other?.username || "?")[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {unread && <Circle className="h-2 w-2 fill-cyan-glow text-cyan-glow" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={cn("text-sm truncate", unread && "font-bold")}>
                          {isUserSender ? "إلى: " : ""}{other?.full_name || other?.username || "غير معروف"}
                        </span>
                        {row.is_draft && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 rounded">مسودة</span>}
                        {row.attachments?.length > 0 && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                        {isStarred && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                      </div>
                      <div className={cn("text-xs truncate", unread ? "text-foreground font-medium" : "text-muted-foreground")}>
                        {row.subject || "(بدون موضوع)"}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {row.body?.slice(0, 80)}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(row.created_at).toLocaleDateString("ar", { month: "short", day: "numeric" })}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Detail */}
        <section className={cn(
          "col-span-12 lg:col-span-6 bg-ice-card border border-ice-border rounded-lg flex flex-col overflow-hidden",
          !selected && "hidden lg:flex"
        )}>
          {selected ? (
            <>
              <div className="p-3 border-b border-ice-border flex items-center gap-1 flex-wrap">
                <Button size="icon" variant="ghost" onClick={() => setSelected(null)} className="md:hidden">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleStar(selected)}>
                  <Star className={cn("h-4 w-4", (selected.sender_id === user?.id ? selected.is_starred_by_sender : selected.is_starred_by_recipient) && "fill-yellow-400 text-yellow-400")} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleImportant(selected)}>
                  <AlertOctagon className={cn("h-4 w-4", selected.is_important && "text-orange-400")} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => archive(selected)}>
                  <Archive className="h-4 w-4" />
                </Button>
                {selected.recipient_id === user?.id && !selected.spam_by_recipient && (
                  <Button size="sm" variant="ghost" onClick={() => markSpam(selected)} title="غير مرغوب">
                    <AlertOctagon className="h-4 w-4 text-red-400" />
                  </Button>
                )}
                {(folder === "trash") ? (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => restoreFromTrash(selected)}>استعادة</Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteForever(selected)} className="text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => moveToTrash(selected)} className="text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex-1" />
                {!selected.is_draft && (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => openCompose({
                      recipient_id: selected.sender_id,
                      subject: selected.subject?.startsWith("Re:") ? selected.subject : `Re: ${selected.subject}`,
                      body: `\n\n--- في ${new Date(selected.created_at).toLocaleString("ar")} كتب ${profiles[selected.sender_id]?.username || ""}:\n${selected.body}`,
                      thread_id: selected.thread_id,
                      reply_to: selected.id,
                    })}>
                      <Reply className="h-4 w-4 mr-1" /> رد
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openCompose({
                      subject: selected.subject?.startsWith("Fwd:") ? selected.subject : `Fwd: ${selected.subject}`,
                      body: `\n\n--- رسالة ممرّرة ---\n${selected.body}`,
                      attachments: selected.attachments,
                    })}>
                      <Forward className="h-4 w-4 mr-1" /> توجيه
                    </Button>
                  </>
                )}
                {selected.is_draft && (
                  <Button size="sm" onClick={() => openCompose(selected)} className="bg-violet-glow/20 text-violet-glow border border-violet-glow/40">
                    تعديل
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h2 className="text-xl font-bold">{selected.subject || "(بدون موضوع)"}</h2>
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profiles[selected.sender_id]?.avatar_url || undefined} />
                    <AvatarFallback>{(profiles[selected.sender_id]?.username || "?")[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {profiles[selected.sender_id]?.full_name || profiles[selected.sender_id]?.username}
                      <span className="text-muted-foreground text-xs mr-2">@{profiles[selected.sender_id]?.username}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      إلى: {selected.recipient_id ? (profiles[selected.recipient_id]?.username || "—") : "—"}
                      {selected.cc_ids?.length > 0 && ` · نسخة: ${selected.cc_ids.map(id => profiles[id]?.username).filter(Boolean).join(", ")}`}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selected.created_at).toLocaleString("ar")}
                  </div>
                </div>

                <div className="whitespace-pre-wrap text-sm leading-7 pt-3 border-t border-ice-border">
                  {selected.body || <span className="text-muted-foreground italic">(فارغ)</span>}
                </div>

                {selected.attachments?.length > 0 && (
                  <div className="pt-3 border-t border-ice-border">
                    <p className="text-xs text-muted-foreground mb-2">المرفقات ({selected.attachments.length})</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selected.attachments.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 p-2 bg-ice-bg rounded border border-ice-border hover:border-violet-glow/50 text-xs">
                          <Paperclip className="h-4 w-4 text-violet-glow shrink-0" />
                          <span className="flex-1 truncate">{a.name}</span>
                          <Download className="h-3 w-3 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">اختر رسالة لعرضها</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        initial={composeInit}
        onSent={() => { load(); setComposeOpen(false); }}
      />
    </PageShell>
  );
}

// ============== Compose Dialog ==============
function ComposeDialog({
  open, onOpenChange, initial, onSent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Partial<MailRow> | null;
  onSent: () => void;
}) {
  const { user } = useAuth();
  const [toQuery, setToQuery] = useState("");
  const [toUser, setToUser] = useState<Profile | null>(null);
  const [ccText, setCcText] = useState("");
  const [bccText, setBccText] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<any>(null);

  // init
  useEffect(() => {
    if (!open) return;
    setSubject(initial?.subject || "");
    setBody(initial?.body || "");
    setExistingAttachments((initial?.attachments as Attachment[]) || []);
    setDraftId(initial?.is_draft ? (initial?.id as string) : null);
    setFiles([]);
    setCcText(""); setBccText(""); setShowCc(false);
    if (initial?.recipient_id) {
      supabase.from("profiles").select("id,username,full_name,avatar_url")
        .eq("id", initial.recipient_id).maybeSingle()
        .then(({ data }) => { if (data) { setToUser(data as any); setToQuery((data as any).username); } });
    } else {
      setToUser(null); setToQuery("");
    }
  }, [open, initial]);

  // search recipients
  useEffect(() => {
    if (!toQuery.trim() || toUser?.username === toQuery) { setResults([]); return; }
    setSearching(true);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,username,full_name,avatar_url")
        .or(`username.ilike.%${toQuery}%,full_name.ilike.%${toQuery}%`)
        .neq("id", user?.id || "")
        .limit(8);
      setResults((data as any) || []);
      setSearching(false);
    }, 250);
  }, [toQuery, toUser, user?.id]);

  async function uploadFiles(): Promise<Attachment[]> {
    if (!user || files.length === 0) return [];
    const out: Attachment[] = [];
    for (const f of files) {
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${f.name}`;
      const { error } = await supabase.storage.from("mail-attachments").upload(path, f);
      if (error) { toast.error(`تعذر رفع ${f.name}`); continue; }
      const { data } = await supabase.storage.from("mail-attachments").createSignedUrl(path, 60 * 60 * 24 * 365);
      out.push({ name: f.name, url: data?.signedUrl || "", size: f.size, type: f.type });
    }
    return out;
  }

  async function resolveCcIds(text: string): Promise<string[]> {
    const usernames = text.split(/[,;\s]+/).map((s) => s.trim().replace(/^@/, "")).filter(Boolean);
    if (!usernames.length) return [];
    const { data } = await supabase.from("profiles").select("id,username").in("username", usernames);
    return (data || []).map((p: any) => p.id);
  }

  async function save(asDraft: boolean) {
    if (!user) return;
    if (!asDraft && !toUser) { toast.error("اختر مستلماً"); return; }
    setSending(true);
    try {
      const newAttachments = await uploadFiles();
      const allAttachments = [...existingAttachments, ...newAttachments];
      const cc_ids = await resolveCcIds(ccText);
      const bcc_ids = await resolveCcIds(bccText);

      const payload: any = {
        sender_id: user.id,
        recipient_id: toUser?.id || null,
        cc_ids, bcc_ids,
        subject: subject.trim(),
        body: body.trim(),
        attachments: allAttachments,
        is_draft: asDraft,
        sent_at: asDraft ? null : new Date().toISOString(),
        thread_id: initial?.thread_id || undefined,
        reply_to: initial?.reply_to || null,
      };
      if (payload.thread_id === undefined) delete payload.thread_id;

      if (draftId) {
        const { error } = await supabase.from("mail_messages").update(payload).eq("id", draftId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("mail_messages").insert(payload);
        if (error) throw error;
      }
      toast.success(asDraft ? "تم حفظ المسودة" : "تم الإرسال 📨");
      onSent();
    } catch (err: any) {
      toast.error(err?.message || "فشل");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ice-card border-ice-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>رسالة جديدة</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* To */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">إلى:</span>
              {toUser ? (
                <div className="flex items-center gap-2 bg-violet-glow/15 text-violet-glow border border-violet-glow/40 px-2 py-1 rounded text-sm">
                  <Avatar className="h-5 w-5"><AvatarImage src={toUser.avatar_url || undefined} /><AvatarFallback>{toUser.username[0]}</AvatarFallback></Avatar>
                  @{toUser.username}
                  <button onClick={() => { setToUser(null); setToQuery(""); }}><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <Input
                  placeholder="ابحث باسم المستخدم..."
                  value={toQuery}
                  onChange={(e) => setToQuery(e.target.value)}
                  className="bg-ice-bg border-ice-border flex-1 h-8"
                />
              )}
              <button type="button" onClick={() => setShowCc(!showCc)} className="text-xs text-muted-foreground hover:text-violet-glow">
                نسخة
              </button>
            </div>
            {!toUser && results.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-ice-card border border-ice-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {results.map((p) => (
                  <button key={p.id} onClick={() => { setToUser(p); setToQuery(p.username); setResults([]); }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-ice-bg text-right">
                    <Avatar className="h-7 w-7"><AvatarImage src={p.avatar_url || undefined} /><AvatarFallback>{p.username[0]}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="text-sm">{p.full_name || p.username}</div>
                      <div className="text-xs text-muted-foreground">@{p.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {showCc && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12">نسخة:</span>
                <Input value={ccText} onChange={(e) => setCcText(e.target.value)} placeholder="@user1, @user2"
                  className="bg-ice-bg border-ice-border flex-1 h-8" dir="ltr" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-12">مخفية:</span>
                <Input value={bccText} onChange={(e) => setBccText(e.target.value)} placeholder="@user3"
                  className="bg-ice-bg border-ice-border flex-1 h-8" dir="ltr" />
              </div>
            </>
          )}

          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="الموضوع"
            className="bg-ice-bg border-ice-border" maxLength={200} />

          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="اكتب رسالتك..."
            rows={10} className="bg-ice-bg border-ice-border resize-none" />

          {/* Attachments */}
          {(files.length > 0 || existingAttachments.length > 0) && (
            <div className="space-y-1">
              {existingAttachments.map((a, i) => (
                <div key={`e${i}`} className="flex items-center gap-2 p-2 bg-ice-bg rounded text-xs border border-ice-border">
                  <Paperclip className="h-3 w-3 text-violet-glow" />
                  <span className="flex-1 truncate">{a.name}</span>
                  <button onClick={() => setExistingAttachments(existingAttachments.filter((_, j) => j !== i))}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {files.map((f, i) => (
                <div key={`n${i}`} className="flex items-center gap-2 p-2 bg-ice-bg rounded text-xs border border-ice-border">
                  <Paperclip className="h-3 w-3 text-cyan-glow" />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-muted-foreground">{(f.size/1024).toFixed(1)} KB</span>
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input ref={fileRef} type="file" multiple className="hidden"
            onChange={(e) => { setFiles([...files, ...Array.from(e.target.files || [])]); e.target.value = ""; }} />

          <div className="flex items-center gap-2 pt-2 border-t border-ice-border">
            <Button onClick={() => save(false)} disabled={sending || !toUser}
              className="bg-violet-glow/20 hover:bg-violet-glow/30 text-violet-glow border border-violet-glow/40">
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              إرسال
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="bg-ice-bg border-ice-border">
              <Paperclip className="h-4 w-4 mr-1" /> إرفاق
            </Button>
            <Button variant="ghost" onClick={() => save(true)} disabled={sending}>
              حفظ كمسودة
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" onClick={() => onOpenChange(false)}>إلغاء</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
