import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentsSection } from "@/components/feed/CommentsSection";
import { ArrowLeft, Plus, Check, Loader2 } from "lucide-react";
import { getYoutubeVideoMeta } from "@/utils/youtube.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/watch-yt/$videoId")({
  component: WatchYtPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-destructive">خطأ: {error.message}</div>
  ),
});

function WatchYtPage() {
  const { videoId } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [postId, setPostId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: meta, isLoading } = useQuery({
    queryKey: ["yt-meta", videoId],
    queryFn: () => getYoutubeVideoMeta({ data: { videoId } }),
  });

  // Look up if this video has already been added as a post (to enable comments + add state)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const { data: existing } = await supabase
        .from("posts")
        .select("id")
        .contains("media_urls", [ytUrl])
        .maybeSingle();
      if (cancelled) return;
      if (existing) setPostId(existing.id);
    })();
    return () => { cancelled = true; };
  }, [user?.id, videoId]);

  const addToSite = async () => {
    if (!user || !meta) return;
    setAdding(true);
    try {
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const { data: created, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          type: "video" as any,
          content: meta.title,
          media_urls: [ytUrl],
        })
        .select("id")
        .single();
      if (error) throw error;
      setPostId(created.id);
      toast.success("تمت إضافة الفيديو إلى الموقع");
    } catch (e: any) {
      toast.error(e.message || "تعذّرت الإضافة");
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-5xl space-y-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => router.history.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 ml-1" /> رجوع
      </Button>

      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden mb-4">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={meta?.title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold mb-1">{meta?.title || "Video"}</h1>
          {meta?.author && <p className="text-sm text-muted-foreground">{meta.author}</p>}
        </div>
        <div className="flex gap-2">
          {postId ? (
            <Button size="sm" variant="secondary" disabled className="gap-1">
              <Check className="h-4 w-4" /> مُضاف إلى الموقع
            </Button>
          ) : (
            <Button size="sm" onClick={addToSite} disabled={adding || !user || !meta} className="gap-1">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              إضافة إلى الموقع
            </Button>
          )}
        </div>
      </div>

      <Card className="p-4 mb-4 bg-muted/40">
        <p className="text-sm text-muted-foreground">
          فيديو يُعرض داخل التطبيق. أضِفه إلى الموقع ليظهر في الخلاصة ويُمكّن التعليقات.
        </p>
      </Card>

      <h2 className="font-semibold mb-3">التعليقات</h2>
      {postId ? (
        <CommentsSection postId={postId} />
      ) : (
        <p className="text-sm text-muted-foreground">سجّل الدخول لفتح التعليقات.</p>
      )}
    </div>
  );
}
