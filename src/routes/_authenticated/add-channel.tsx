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
  ExternalLink,
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
        .select("channel_id, channel_url")
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
        for (const v of res.videos) if (!existingVideoIds.has(v.videoId)) fresh.add(v.videoId);
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
    try {
      // Save channel if new
      if (!channelAlreadyAdded) {
        const { error: chErr } = await supabase.from("user_channels").insert({
          user_id: user.id,
          platform: "youtube",
          channel_url: url.trim(),
          channel_id: preview.channel.channelId,
          channel_name: preview.channel.title,
          channel_avatar: preview.channel.avatar,
        });
        if (chErr) throw chErr;
      }

      // Insert posts (skip duplicates)
      const toInsert = preview.videos
        .filter((v) => selected.has(v.videoId) && !existingVideoIds.has(v.videoId))
        .map((v) => ({
          user_id: user.id,
          type: "video" as any,
          content: v.title,
          media_urls: [`https://www.youtube.com/watch?v=${v.videoId}`],
        }));

      if (toInsert.length > 0) {
        const { error: pErr } = await supabase.from("posts").insert(toInsert);
        if (pErr) throw pErr;
      }

      toast.success(
        toInsert.length > 0
          ? `تم نشر ${toInsert.length} فيديو في الخلاصة و Reels`
          : "كل الفيديوهات منشورة مسبقاً",
      );
      await Promise.all([refetchChannels(), refetchPosts()]);
      setPreview(null);
      setUrl("");
      setSelected(new Set());
    } catch (e: any) {
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

          {/* Channel info */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[oklch(0.08_0.015_260/0.6)]">
            {preview.channel.avatar ? (
              <img src={preview.channel.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                <Youtube className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate">{preview.channel.title}</h3>
              <p className="text-xs text-muted-foreground">
                {preview.videos.length} فيديو متاح • {selected.size} محدد للنشر
              </p>
            </div>
            <a
              href={`https://www.youtube.com/channel/${preview.channel.channelId}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> YouTube
            </a>
          </div>

          {/* Videos grid */}
          {preview.videos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لا توجد فيديوهات لعرضها.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
              {preview.videos.map((v) => {
                const isExisting = existingVideoIds.has(v.videoId);
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
                  for (const v of preview.videos) if (!existingVideoIds.has(v.videoId)) all.add(v.videoId);
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
      <MyChannelsCard onSynced={() => { refetchChannels(); refetchPosts(); }} />
    </div>
  );
}
