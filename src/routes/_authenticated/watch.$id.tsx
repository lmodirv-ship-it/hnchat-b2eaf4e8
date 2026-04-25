import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentsSection } from "@/components/feed/CommentsSection";
import { Heart, Share2, Eye, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/watch/$id")({
  component: WatchPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-destructive">خطأ: {error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p>الفيديو غير موجود</p>
      <Link to="/videos" className="text-primary underline">العودة للفيديوهات</Link>
    </div>
  ),
});

function WatchPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ["watch-video", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles:user_id(id, username, full_name, avatar_url, followers_count, is_verified)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["watch-related", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, content, media_urls, views_count, likes_count, created_at, profiles:user_id(username, full_name, avatar_url)")
        .in("type", ["video", "short"])
        .neq("id", id)
        .order("views_count", { ascending: false })
        .limit(15);
      return data || [];
    },
  });

  // Increment view count once
  useEffect(() => {
    if (!video) return;
    supabase
      .from("posts")
      .update({ views_count: (video.views_count || 0) + 1 })
      .eq("id", id)
      .then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id]);

  // Check if liked
  useEffect(() => {
    if (!user || !video) return;
    supabase
      .from("likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setLiked(!!data));
  }, [user, video, id]);

  const toggleLike = async () => {
    if (!user) return toast.error("سجّل الدخول أولًا");
    if (liked) {
      await supabase.from("likes").delete().eq("post_id", id).eq("user_id", user.id);
      setLiked(false);
    } else {
      await supabase.from("likes").insert({ post_id: id, user_id: user.id });
      setLiked(true);
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ url, title: video?.content || "فيديو" }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("تم نسخ الرابط");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">الفيديو غير موجود</p>
        <Button onClick={() => router.history.back()}>عودة</Button>
      </div>
    );
  }

  const videoUrl = video.media_urls?.[0];
  const profile: any = video.profiles;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Button variant="ghost" size="sm" onClick={() => router.history.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 ml-1" /> رجوع
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            {videoUrl ? (
              <video src={videoUrl} controls autoPlay className="w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                لا يوجد فيديو
              </div>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-bold">{video.content || "بدون عنوان"}</h1>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-3 hover:opacity-80"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold flex items-center gap-1">
                  {profile?.full_name || profile?.username}
                  {profile?.is_verified && <Badge variant="secondary" className="h-4 text-[10px]">✓</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {profile?.followers_count || 0} متابع
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Button variant={liked ? "default" : "outline"} size="sm" onClick={toggleLike}>
                <Heart className={`h-4 w-4 ml-1 ${liked ? "fill-current" : ""}`} />
                {video.likes_count || 0}
              </Button>
              <Button variant="outline" size="sm" onClick={share}>
                <Share2 className="h-4 w-4 ml-1" /> مشاركة
              </Button>
            </div>
          </div>

          <Card className="p-4 bg-muted/40">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {video.views_count || 0} مشاهدة</span>
              <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true, locale: ar })}</span>
            </div>
            {video.content && <p className="text-sm whitespace-pre-wrap">{video.content}</p>}
          </Card>

          <div>
            <h2 className="font-semibold mb-3">التعليقات ({video.comments_count || 0})</h2>
            <CommentsSection postId={id} />
          </div>
        </div>

        {/* Sidebar: related videos */}
        <aside className="space-y-3">
          <h2 className="font-semibold">فيديوهات مقترحة</h2>
          {related?.map((v: any) => (
            <Link
              key={v.id}
              to="/watch/$id"
              params={{ id: v.id }}
              className="flex gap-2 hover:bg-muted/50 p-2 rounded-lg transition"
            >
              <div className="relative w-40 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                {v.media_urls?.[0] && (
                  <video src={v.media_urls[0]} className="w-full h-full object-cover" muted />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">{v.content || "بدون عنوان"}</p>
                <p className="text-xs text-muted-foreground mt-1">{v.profiles?.username}</p>
                <p className="text-xs text-muted-foreground">{v.views_count || 0} مشاهدة</p>
              </div>
            </Link>
          ))}
          {related?.length === 0 && (
            <p className="text-sm text-muted-foreground">لا توجد فيديوهات أخرى</p>
          )}
        </aside>
      </div>
    </div>
  );
}
