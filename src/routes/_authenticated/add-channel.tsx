import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Youtube,
  Film,
  Sparkles,
  Loader2,
  Search,
  CheckCircle2,
  Upload,
  AlertCircle,
  Play,
  Calendar,
  
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { importYoutubeChannel, type YtChannel, type YtVideo } from "@/utils/youtube.functions";
import { toast } from "sonner";
import { MyChannelsCard } from "@/components/feed/MyChannelsCard";

export const Route = createFileRoute("/_authenticated/add-channel")({
  head: () => ({
    meta: [
      { title: "إضافة قناة — استورد قنواتك إلى الخلاصة" },
      { name: "description", content: "ألصق رابط قناة YouTube، عاين الفيديوهات، ثم أكّد النشر إلى الخلاصة و Reels." },
    ],
  }),
  component: AddChannelPage,
});

type Preview = { channel: YtChannel; videos: YtVideo[] } | null;

function AddChannelPage() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Preview>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Existing channels (to detect duplicates)
  const { data: myChannels = [], refetch: refetchChannels } = useQuery({
    queryKey: ["my-channels-ids", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_channels")
        .select("id, channel_id, channel_url")
        .eq("user_id", user!.id);
      return data ?? [];
    },
  });

  // Existing posts videoIds (to prevent duplicate publish)
  const { data: existingVideoIds = new Set<string>(), refetch: refetchPosts } = useQuery({
    queryKey: ["my-yt-posts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("media_urls")
        .eq("user_id", user!.id);
      const set = new Set<string>();
      for (const row of data ?? []) {
        for (const u of row.media_urls ?? []) {
          const m = u.match(/[?&]v=([\w-]{11})|youtu\.be\/([\w-]{11})/);
          const id = m?.[1] || m?.[2];
          if (id) set.add(id);
        }
      }
      return set;
    },
  });

  const { data: existingTrackedVideoIds = new Set<string>(), refetch: refetchTrackedVideos } = useQuery({
    queryKey: ["my-channel-videos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("channel_videos")
        .select("video_id")
        .eq("user_id", user!.id)
        .eq("platform", "youtube");
      return new Set((data ?? []).map((row) => row.video_id));
    },
  });

  const channelAlreadyAdded = preview
    ? myChannels.some(
        (c) =>
          c.channel_id === preview.channel.channelId ||
          c.channel_url === url.trim(),
      )
    : false;

  async function handlePreview() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await importYoutubeChannel({ data: { url: url.trim() } });
      if ("error" in res) {
        setError(res.error);
      } else {
        setPreview(res);
        // Pre-select only new videos
        const fresh = new Set<string>();
        for (const v of res.videos) if (!existingTrackedVideoIds.has(v.videoId)) fresh.add(v.videoId);
        setSelected(fresh);
      }
    } catch (e: any) {
      setError(e.message || "تعذّر جلب القناة");
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handlePublish() {
    if (!user || !preview) return;
    if (selected.size === 0) {
      toast.error("اختر فيديو واحدًا على الأقل");
      return;
    }
    setPublishing(true);

    // 1. Create import session (pending)
    const { data: session } = await supabase
      .from("channel_import_sessions")
      .insert({
        user_id: user.id,
        source_url: url.trim(),
        platform: "youtube",
        status: "pending",
        videos_found: preview.videos.length,
      })
      .select("id")
      .single();

    try {
      // 2. Upsert channel
      let channelRowId: string | null = null;
      const existingCh = myChannels.find(
        (c) => c.channel_id === preview.channel.channelId || c.channel_url === url.trim(),
      ) as any;
      if (existingCh?.id) {
        channelRowId = existingCh.id;
      } else {
        const { data: chRow, error: chErr } = await supabase
          .from("user_channels")
          .insert({
            user_id: user.id,
            platform: "youtube",
            channel_url: url.trim(),
            channel_id: preview.channel.channelId,
            channel_name: preview.channel.title,
            channel_avatar: preview.channel.avatar,
          })
          .select("id")
          .single();
        if (chErr) throw chErr;
        channelRowId = chRow!.id;
      }

      if (!channelRowId) {
        throw new Error("تعذّر تحديد القناة لحفظ الفيديوهات");
      }
      const confirmedChannelRowId = channelRowId;

      // 3. Filter new videos
      const selectedVideos = preview.videos.filter((v) => selected.has(v.videoId));
      const selectedUrls = selectedVideos.map((v) => `https://www.youtube.com/watch?v=${v.videoId}`);
      const { data: existingPosts, error: existingPostsErr } = await supabase
        .from("posts")
        .select("id, media_urls")
        .eq("user_id", user.id)
        .overlaps("media_urls", selectedUrls);
      if (existingPostsErr) throw existingPostsErr;

      const existingPostByVideoId = new Map<string, string>();
      for (const row of existingPosts ?? []) {
        for (const mediaUrl of row.media_urls ?? []) {
          const m = mediaUrl.match(/[?&]v=([\w-]{11})|youtu\.be\/([\w-]{11})/);
          const id = m?.[1] || m?.[2];
          if (id) existingPostByVideoId.set(id, row.id);
        }
      }

      const { data: existingChannelVideos, error: existingVideosErr } = await supabase
        .from("channel_videos")
        .select("video_id")
        .eq("user_id", user.id)
        .eq("platform", "youtube")
        .in("video_id", selectedVideos.map((v) => v.videoId));
      if (existingVideosErr) throw existingVideosErr;

      const savedVideoIds = new Set((existingChannelVideos ?? []).map((v) => v.video_id));
      const videosNeedingPosts = selectedVideos.filter((v) => !existingPostByVideoId.has(v.videoId));
      const videosNeedingTracking = selectedVideos.filter((v) => !savedVideoIds.has(v.videoId));
      const skipped = selected.size - videosNeedingTracking.length;

      // 4. Create posts (feed + reels source)
      let postIds: string[] = [];
      if (videosNeedingPosts.length > 0) {
        const { data: postsData, error: pErr } = await supabase
          .from("posts")
          .insert(
            videosNeedingPosts.map((v) => ({
              user_id: user.id,
              type: "video" as any,
              content: v.title,
              media_urls: [`https://www.youtube.com/watch?v=${v.videoId}`],
            })),
          )
          .select("id");
        if (pErr) throw pErr;
        postIds = (postsData ?? []).map((p) => p.id);
        videosNeedingPosts.forEach((v, i) => {
          if (postIds[i]) existingPostByVideoId.set(v.videoId, postIds[i]);
        });
      }

      // 5. Track each video in channel_videos
      if (videosNeedingTracking.length > 0) {
        const { error: videosErr } = await supabase.from("channel_videos").insert(
          videosNeedingTracking.map((v) => ({
            user_id: user.id,
            channel_id: confirmedChannelRowId,
            platform: "youtube",
            video_id: v.videoId,
            video_url: `https://www.youtube.com/watch?v=${v.videoId}`,
            title: v.title,
            description: v.description,
            thumbnail: v.thumbnail,
            author: v.author,
            published_at: v.publishedAt || null,
            show_in_feed: true,
            show_in_reels: true,
            is_published: true,
            post_id: existingPostByVideoId.get(v.videoId) ?? null,
            published_at_app: new Date().toISOString(),
          })),
        );
        if (videosErr) throw videosErr;
      }

      // 6. Mark session complete
      if (session?.id) {
        await supabase
          .from("channel_import_sessions")
          .update({
            status: "completed",
            channel_id: channelRowId,
            videos_imported: videosNeedingTracking.length,
            videos_skipped: skipped,
            completed_at: new Date().toISOString(),
          })
          .eq("id", session.id);
      }

      toast.success(
        videosNeedingTracking.length > 0 || videosNeedingPosts.length > 0
          ? `تم حفظ ونشر ${Math.max(videosNeedingTracking.length, videosNeedingPosts.length)} فيديو في الخلاصة و Reels`
          : "كل الفيديوهات منشورة مسبقاً",
      );
      await Promise.all([refetchChannels(), refetchPosts(), refetchTrackedVideos()]);
      setPreview(null);
      setUrl("");
      setSelected(new Set());
    } catch (e: any) {
      if (session?.id) {
        await supabase
          .from("channel_import_sessions")
          .update({ status: "failed", error_message: e.message, completed_at: new Date().toISOString() })
          .eq("id", session.id);
      }
      toast.error(e.message || "فشل النشر");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Header bar */}
      <header className="mb-6 rounded-2xl bg-gradient-to-br from-red-600/15 via-red-600/5 to-transparent border border-red-600/20 p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/40 shrink-0">
          <Youtube className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">إضافة قناة YouTube</h1>
          <p className="text-sm text-muted-foreground">
            ألصق الرابط، عاين الفيديوهات، ثم أكّد النشر — تظهر فوراً في الخلاصة و Reels.
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <Badge variant="outline" className="gap-1"><Sparkles className="h-3 w-3" /> الخلاصة</Badge>
          <Badge variant="outline" className="gap-1"><Film className="h-3 w-3" /> Reels</Badge>
        </div>
      </header>

      {/* Step 1: URL input + preview button */}
      <Card className="p-5 mb-5 bg-[oklch(0.06_0.015_260/0.5)] border-[oklch(1_0_0/0.05)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</div>
          <h2 className="font-semibold">رابط القناة</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/@channelname"
            dir="ltr"
            disabled={loading || publishing}
            onKeyDown={(e) => e.key === "Enter" && handlePreview()}
            className="flex-1"
          />
          <Button
            onClick={handlePreview}
            disabled={loading || publishing || !url.trim()}
            className="gap-2 min-w-[140px]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "جاري الجلب..." : "استيراد ومعاينة"}
          </Button>
        </div>
        <Button
          onClick={handlePublish}
          disabled={publishing || !preview || selected.size === 0}
          className="mt-2 w-full gap-2"
        >
          {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {publishing ? "جاري النشر..." : preview && selected.size > 0 ? `تأكيد النشر (${selected.size})` : "تأكيد النشر"}
        </Button>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {channelAlreadyAdded && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 rounded-lg p-2">
            <CheckCircle2 className="h-4 w-4" />
            هذه القناة مضافة لديك. يمكنك إضافة الفيديوهات الجديدة فقط.
          </div>
        )}
      </Card>

      {/* Step 2: Preview + confirm publish */}
      {preview && (
        <Card className="p-5 mb-5 bg-[oklch(0.06_0.015_260/0.5)] border-[oklch(1_0_0/0.05)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</div>
            <h2 className="font-semibold">تأكيد النشر</h2>
          </div>

          {/* Compact summary (no channel name / no external links) */}
          <div className="mb-4 p-3 rounded-xl bg-[oklch(0.08_0.015_260/0.6)] text-sm text-muted-foreground">
            {preview.videos.length} فيديو متاح • {selected.size} محدد للنشر
          </div>

          {/* Videos grid */}
          {preview.videos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لا توجد فيديوهات لعرضها.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
              {preview.videos.map((v) => {
                const isExisting = existingTrackedVideoIds.has(v.videoId);
                const isSelected = selected.has(v.videoId);
                return (
                  <button
                    key={v.videoId}
                    onClick={() => !isExisting && toggle(v.videoId)}
                    disabled={isExisting}
                    className={`group relative text-right rounded-xl overflow-hidden border-2 transition-all ${
                      isExisting
                        ? "border-transparent opacity-50 cursor-not-allowed"
                        : isSelected
                          ? "border-primary shadow-lg shadow-primary/20"
                          : "border-transparent hover:border-[oklch(1_0_0/0.2)]"
                    }`}
                  >
                    <div className="relative aspect-video bg-black">
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute top-2 right-2">
                        {isExisting ? (
                          <Badge className="bg-green-600/90 text-white border-0 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> منشور
                          </Badge>
                        ) : isSelected ? (
                          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-black/60 border border-white/30" />
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2 h-9 w-9 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="p-2.5 bg-[oklch(0.08_0.015_260/0.6)]">
                      <p className="text-xs font-medium line-clamp-2 mb-1">{v.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(v.publishedAt).toLocaleDateString("ar")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Action bar */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between border-t border-[oklch(1_0_0/0.05)] pt-4">
            <div className="flex gap-2 text-xs">
              <button
                className="text-primary hover:underline"
                onClick={() => {
                  const all = new Set<string>();
                  for (const v of preview.videos) if (!existingTrackedVideoIds.has(v.videoId)) all.add(v.videoId);
                  setSelected(all);
                }}
              >
                تحديد الكل الجديد
              </button>
              <span className="text-muted-foreground">•</span>
              <button className="text-muted-foreground hover:underline" onClick={() => setSelected(new Set())}>
                إلغاء التحديد
              </button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => { setPreview(null); setSelected(new Set()); }} disabled={publishing}>
                إلغاء
              </Button>
              <Button onClick={handlePublish} disabled={publishing || selected.size === 0} className="gap-2 min-w-[160px]">
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {publishing ? "جاري النشر..." : `نشر ${selected.size} فيديو`}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Where they appear */}
      <div className="grid gap-3 sm:grid-cols-2 mb-5">
        <Card className="p-4 bg-[oklch(0.06_0.015_260/0.5)] border-[oklch(1_0_0/0.05)]">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">في الخلاصة</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            تظهر الفيديوهات مع إعجاب وتعليق ومشاركة وعدّاد مشاهدات.
          </p>
          <Link to="/feed"><Button variant="outline" size="sm" className="w-full">عرض الخلاصة</Button></Link>
        </Card>
        <Card className="p-4 bg-[oklch(0.06_0.015_260/0.5)] border-[oklch(1_0_0/0.05)]">
          <div className="flex items-center gap-2 mb-1">
            <Film className="h-4 w-4 text-pink-500" />
            <h3 className="font-semibold text-sm">في Reels</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            تجربة عمودية كاملة الشاشة بأسلوب TikTok.
          </p>
          <Link to="/reels"><Button variant="outline" size="sm" className="w-full">فتح Reels</Button></Link>
        </Card>
      </div>

      {/* Existing channels */}
      <MyChannelsCard onSynced={() => { refetchChannels(); refetchPosts(); refetchTrackedVideos(); }} />
    </div>
  );
}
