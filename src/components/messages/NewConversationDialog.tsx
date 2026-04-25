import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface ProfileRow {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export function NewConversationDialog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      if (!q.trim() || !user) {
        setResults([]);
        return;
      }
      setSearching(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .neq("id", user.id)
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(10);
      setResults((data || []) as ProfileRow[]);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q, open, user?.id]);

  async function startConversation(targetId: string) {
    if (!user || creating) return;
    setCreating(true);
    try {
      // Find existing 1:1 conversation
      const { data: myParts } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);
      const myConvIds = (myParts || []).map((p) => p.conversation_id);

      let existingId: string | null = null;
      if (myConvIds.length) {
        const { data: shared } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", targetId)
          .in("conversation_id", myConvIds);
        const candidateIds = (shared || []).map((s) => s.conversation_id);
        if (candidateIds.length) {
          const { data: convs } = await supabase
            .from("conversations")
            .select("id, is_group")
            .in("id", candidateIds)
            .eq("is_group", false);
          if (convs && convs.length) existingId = convs[0].id;
        }
      }

      if (existingId) {
        setOpen(false);
        navigate({ to: "/messages/$conversationId", params: { conversationId: existingId } });
        return;
      }

      // Create new conversation
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({ is_group: false })
        .select("id")
        .single();
      if (convErr || !conv) throw convErr;

      const { error: partsErr } = await supabase
        .from("conversation_participants")
        .insert([
          { conversation_id: conv.id, user_id: user.id },
          { conversation_id: conv.id, user_id: targetId },
        ]);
      if (partsErr) throw partsErr;

      setOpen(false);
      navigate({ to: "/messages/$conversationId", params: { conversationId: conv.id } });
    } catch (e: any) {
      toast.error(e?.message || "تعذر بدء المحادثة");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40">
          <Plus className="h-4 w-4 mr-1" /> محادثة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-ice-card border-ice-border">
        <DialogHeader>
          <DialogTitle>ابدأ محادثة جديدة</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم أو @username"
            className="bg-ice-bg border-ice-border pr-9"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto space-y-1">
          {searching && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-glow" />
            </div>
          )}
          {!searching && q && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">لا نتائج</p>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              disabled={creating}
              onClick={() => startConversation(p.id)}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-ice-border/40 transition text-right disabled:opacity-50"
            >
              <Avatar className="h-9 w-9 border border-ice-border">
                <AvatarImage src={p.avatar_url || undefined} />
                <AvatarFallback className="bg-cyan-glow/10 text-cyan-glow text-xs">
                  {(p.full_name || p.username).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-medium truncate">
                  {p.full_name || p.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">@{p.username}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
