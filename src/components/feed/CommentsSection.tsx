import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface CommentRow {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: { username: string; full_name: string | null; avatar_url: string | null } | null;
}

export function CommentsSection({ postId, onChange }: { postId: string; onChange?: () => void }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const { data: comments, refetch, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, created_at, user_id")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      const ids = [...new Set((data ?? []).map((c) => c.user_id))];
      if (ids.length === 0) return [] as CommentRow[];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((c) => ({ ...c, profile: map.get(c.user_id) ?? null })) as CommentRow[];
    },
  });

  async function send() {
    if (!user || !text.trim()) return;
    setSending(true);
    const { error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, content: text.trim() });
    setSending(false);
    if (error) return toast.error(error.message);
    setText("");
    refetch();
    onChange?.();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refetch();
    onChange?.();
  }

  return (
    <div className="mt-4 pt-4 border-t border-ice-border space-y-3">
      {isLoading && <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />}
      {comments?.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">كن أول من يعلّق</p>
      )}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {comments?.map((c) => (
          <div key={c.id} className="flex gap-2 group">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-glow to-violet-glow flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0 overflow-hidden">
              {c.profile?.avatar_url ? (
                <img src={c.profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                c.profile?.username?.[0]?.toUpperCase() ?? "?"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-ice-card rounded-2xl px-3 py-2 border border-ice-border">
                <div className="text-xs font-semibold mb-0.5">
                  {c.profile?.full_name ?? c.profile?.username ?? "User"}
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{c.content}</p>
              </div>
              <div className="flex items-center gap-2 mt-1 px-3">
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(c.created_at), { locale: ar, addSuffix: true })}
                </span>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => remove(c.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-destructive hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> حذف
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {user && (
        <div className="flex gap-2 items-center">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="اكتب تعليقاً..."
            className="bg-ice-card border-ice-border h-9 text-sm"
          />
          <Button
            size="sm"
            onClick={send}
            disabled={!text.trim() || sending}
            className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground h-9 px-3"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
