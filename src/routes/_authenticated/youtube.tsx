import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Youtube, Search, Play, Clock, AlertCircle, History, Plus, Check, Loader2, PlusSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { importYoutubeChannel, type YtChannel, type YtVideo } from "@/utils/youtube.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/youtube")({
  component: YoutubePage,
  head: () => ({
    meta: [
      { title: "YouTube — استورد قناة" },
      { name: "description", content: "ألصق رابط قناة YouTube لعرض كل فيديوهاتها داخل التطبيق." },
    ],
  }),
});

type Result = { channel: YtChannel; videos: YtVideo[] };
type HistoryEntry = { url: string; title: string; avatar: string | null; at: number };

function YoutubePage() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [bulkAdding, setBulkAdding] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("yt-history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const mutation = useMutation({
    mutationFn: async (u: string) => {
      const res = await importYoutubeChannel({ data: { url: u } });
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    onSuccess: (data, u) => {
      setResult(data);
      const entry: HistoryEntry = {
        url: u,
        title: data.channel.title,
        avatar: data.channel.avatar,
        at: Date.now(),
      };
      const next = [entry, ...history.filter((h) => h.url !== u)].slice(0, 10);
      setHistory(next);
      try { localStorage.setItem("yt-history", JSON.stringify(next)); } catch {}
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // After loading channel, check which videos are already added
  useEffect(() => {
    if (!result || !user) return;
    const urls = result.videos.map((v) => `https://www.youtube.com/watch?v=${v.videoId}`);
    if (urls.length === 0) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("posts")
        .select("media_urls")
        .overlaps("media_urls", urls);
      if (cancelled || !data) return;
      const found = new Set<string>();
      for (const row of data) {
        for (const u of row.media_urls || []) {
          const m = u.match(/[?&]v=([\w-]{11})|youtu\.be\/([\w-]{11})/);
          const id = m?.[1] || m?.[2];
          if (id) found.add(id);
        }
      }
      setAddedIds(found);
    })();
    return () => { cancelled = true; };
  }, [result, user?.id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setAddedIds(new Set());
    mutation.mutate(url.trim());
  };

  const addVideo = async (v: YtVideo) => {
    if (!user || addedIds.has(v.videoId)) return;
    setAddingId(v.videoId);
    try {
      const ytUrl = `https://www.youtube.com/watch?v=${v.videoId}`;
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        type: "video" as any,
        content: v.title,
        media_urls: [ytUrl],
      });
      if (error) throw error;
      setAddedIds((s) => new Set(s).add(v.videoId));
      toast.success("تمت الإضافة إلى الخلاصة");
    } catch (e: any) {
      toast.error(e.message || "تعذّرت الإضافة");
    } finally {
      setAddingId(null);
    }
  };

  const addAll = async () => {
    if (!user || !result) return;
    const toAdd = result.videos.filter((v) => !addedIds.has(v.videoId));
    if (toAdd.length === 0) {
      toast.info("كل الفيديوهات مُضافة بالفعل");
      return;
    }
    setBulkAdding(true);
    try {
      const rows = toAdd.map((v) => ({
        user_id: user.id,
        type: "video" as any,
        content: v.title,
        media_urls: [`https://www.youtube.com/watch?v=${v.videoId}`],
      }));
      const { error } = await supabase.from("posts").insert(rows);
      if (error) throw error;
      setAddedIds((s) => {
        const n = new Set(s);
        toAdd.forEach((v) => n.add(v.videoId));
        return n;
      });
      toast.success(`تمت إضافة ${toAdd.length} فيديو إلى الخلاصة`);
    } catch (e: any) {
      toast.error(e.message || "تعذّرت إضافة الفيديوهات");
    } finally {
      setBulkAdding(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="mb-6 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-red-600 flex items-center justify-center">
          <Youtube className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">استيراد قناة فيديو</h1>
          <p className="text-sm text-muted-foreground">ألصق رابط القناة وستظهر آخر فيديوهاتها داخل التطبيق.</p>
        </div>
      </header>

      <form onSubmit={submit} className="mb-6 space-y-2">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/@MrBeast  أو  /channel/UC..."
            className="bg-ice-card border-ice-border h-12 text-base"
            dir="ltr"
          />
          <Button type="submit" size="lg" disabled={mutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
            {mutation.isPending ? "جارٍ التحميل..." : (<><Search className="h-4 w-4 ml-1" /> عرض</>)}
          </Button>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            size="lg"
            onClick={showAndAddAll}
            disabled={mutation.isPending || bulkAdding || !user || !url.trim()}
            className="gap-1"
          >
            {(mutation.isPending || bulkAdding) ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusSquare className="h-4 w-4" />}
            إضافة كل فيديوهات القناة إلى الخلاصة
          </Button>
        </div>
      </form>

      {history.length > 0 && !result && (
        <Card className="p-4 mb-6 bg-ice-card border-ice-border">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3">
            <History className="h-4 w-4" /> قنوات سابقة
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <button
                key={h.url}
                onClick={() => { setUrl(h.url); mutation.mutate(h.url); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-ice-border hover:border-red-600/50 transition text-sm"
              >
                {h.avatar && <img src={h.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />}
                <span>{h.title}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {mutation.isPending && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      )}

      {mutation.isError && !mutation.isPending && (
        <Card className="p-6 bg-destructive/10 border-destructive/40 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-destructive font-medium">{(mutation.error as Error).message}</p>
        </Card>
      )}

      {result && !mutation.isPending && (
        <>
          <Card className="p-4 mb-6 bg-ice-card border-ice-border flex items-center gap-4 flex-wrap">
            {result.channel.avatar && (
              <img src={result.channel.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{result.channel.title}</h2>
              {result.channel.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{result.channel.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {result.videos.length} فيديو · {addedIds.size} مُضاف
              </p>
            </div>
            {result.videos.length > 0 && (
              <Button onClick={addAll} disabled={bulkAdding || !user} className="gap-1">
                {bulkAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusSquare className="h-4 w-4" />}
                إضافة كل الفيديوهات إلى الخلاصة
              </Button>
            )}
          </Card>

          {result.videos.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">لا توجد فيديوهات متاحة لهذه القناة.</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.videos.map((v) => {
                const added = addedIds.has(v.videoId);
                return (
                  <div
                    key={v.videoId}
                    className="group block rounded-xl overflow-hidden border border-ice-border bg-ice-card hover:border-red-600/50 transition"
                  >
                    <Link to="/watch-yt/$videoId" params={{ videoId: v.videoId }}>
                      <div className="relative aspect-video bg-black">
                        <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                          <div className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center">
                            <Play className="h-7 w-7 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 pb-2">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{v.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {v.publishedAt && formatDistanceToNow(new Date(v.publishedAt), { addSuffix: true, locale: ar })}
                        </div>
                      </div>
                    </Link>
                    <div className="px-3 pb-3">
                      {added ? (
                        <Button size="sm" variant="secondary" disabled className="w-full gap-1">
                          <Check className="h-4 w-4" /> مُضاف
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addVideo(v)}
                          disabled={addingId === v.videoId || !user}
                          className="w-full gap-1"
                        >
                          {addingId === v.videoId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          إضافة إلى الخلاصة
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
