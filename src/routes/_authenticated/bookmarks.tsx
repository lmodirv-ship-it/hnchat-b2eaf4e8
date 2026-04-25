import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Trash2, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/bookmarks")({
  component: BookmarksPage,
});

type BookmarkRow = {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  folder: string;
  note: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  post: "منشور",
  video: "فيديو",
  short: "Short",
  product: "منتج",
  catalog_item: "عنصر",
};

function BookmarksPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<string>("all");

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_bookmarks")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BookmarkRow[];
    },
    enabled: !!user?.id,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_bookmarks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
      toast.success("تمت الإزالة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const types = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => set.add(b.item_type));
    return Array.from(set);
  }, [bookmarks]);

  const filtered = tab === "all" ? bookmarks : bookmarks.filter((b) => b.item_type === tab);

  return (
    <PageShell
      title="Bookmarks"
      subtitle={`${bookmarks.length} عنصر محفوظ`}
      action={<Bookmark className="h-5 w-5 text-cyan-glow" />}
    >
      {types.length > 0 && (
        <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-ice-card border border-ice-border w-fit">
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              tab === "all" ? "bg-cyan-glow/20 text-cyan-glow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            الكل ({bookmarks.length})
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                tab === t ? "bg-cyan-glow/20 text-cyan-glow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {TYPE_LABEL[t] ?? t} ({bookmarks.filter((b) => b.item_type === t).length})
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-ice-card border border-ice-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 bg-ice-card border-ice-border text-center">
          <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">لا توجد محفوظات بعد. اضغط أيقونة الإشارة المرجعية على أي محتوى لحفظه هنا.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {filtered.map((b) => (
            <li key={b.id} className="flex items-start gap-3 p-3 rounded-xl border border-ice-border bg-ice-card">
              <div className="h-10 w-10 rounded-xl bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center shrink-0">
                <Bookmark className="h-5 w-5 text-cyan-glow" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{TYPE_LABEL[b.item_type] ?? b.item_type}</div>
                <div className="text-[11px] text-muted-foreground font-mono truncate">{b.item_id}</div>
                {b.note && <div className="text-xs text-muted-foreground mt-1">{b.note}</div>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove.mutate(b.id)}
                disabled={remove.isPending}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
