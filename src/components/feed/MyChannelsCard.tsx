import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Youtube, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { importYoutubeChannel } from "@/utils/youtube.functions";

type UserChannel = {
  id: string;
  platform: string;
  channel_url: string;
  channel_id: string | null;
  channel_name: string | null;
  channel_avatar: string | null;
};

export function MyChannelsCard({ onSynced }: { onSynced?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const { data: channels = [], refetch } = useQuery({
    queryKey: ["my-channels", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_channels")
        .select("id, platform, channel_url, channel_id, channel_name, channel_avatar")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserChannel[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (u: string) => {
      if (!user) throw new Error("يجب تسجيل الدخول");
      const res = await importYoutubeChannel({ data: { url: u } });
      if ("error" in res) throw new Error(res.error);
      const { data: channelRow, error } = await supabase.from("user_channels").insert({
        user_id: user.id,
        platform: "youtube",
        channel_url: u,
        channel_id: res.channel.channelId,
        channel_name: res.channel.title,
        channel_avatar: res.channel.avatar,
      }).select("id").single();
      if (error) throw error;
      if (!channelRow?.id) throw new Error("تعذّر حفظ القناة");
      // Auto-sync videos to feed
      await syncChannelVideos(channelRow.id, res.videos);
      return res;
    },
    onSuccess: () => {
      toast.success("تم إضافة القناة وفيديوهاتها إلى الخلاصة");
      setUrl("");
      setOpen(false);
      refetch();
      onSynced?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function syncChannelVideos(channelRowId: string, videos: { videoId: string; title: string; description?: string; thumbnail?: string; author?: string; publishedAt?: string }[]) {
    if (!user || videos.length === 0) return 0;
    const urls = videos.map((v) => `https://www.youtube.com/watch?v=${v.videoId}`);
    const { data: existing } = await supabase
      .from("posts")
      .select("id, media_urls")
      .eq("user_id", user.id)
      .overlaps("media_urls", urls);
    const already = new Set<string>();
    const postByVideoId = new Map<string, string>();
    for (const row of existing ?? []) {
      for (const x of row.media_urls ?? []) {
        const m = x.match(/[?&]v=([\w-]{11})|youtu\.be\/([\w-]{11})/);
        const id = m?.[1] || m?.[2];
        if (id) {
          already.add(id);
          postByVideoId.set(id, row.id);
        }
      }
    }
    const toAdd = videos.filter((v) => !already.has(v.videoId));
    if (toAdd.length > 0) {
      const rows = toAdd.map((v) => ({
        user_id: user.id,
        type: "video" as any,
        content: v.title,
        media_urls: [`https://www.youtube.com/watch?v=${v.videoId}`],
      }));
      const { data: postsData, error } = await supabase.from("posts").insert(rows).select("id");
      if (error) throw error;
      toAdd.forEach((v, i) => {
        if (postsData?.[i]?.id) postByVideoId.set(v.videoId, postsData[i].id);
      });
    }

    const { data: tracked, error: trackedErr } = await supabase
      .from("channel_videos")
      .select("video_id")
      .eq("user_id", user.id)
      .eq("platform", "youtube")
      .in("video_id", videos.map((v) => v.videoId));
    if (trackedErr) throw trackedErr;
    const trackedIds = new Set((tracked ?? []).map((v) => v.video_id));
    const toTrack = videos.filter((v) => !trackedIds.has(v.videoId));
    if (toTrack.length > 0) {
      const { error: trackErr } = await supabase.from("channel_videos").insert(
        toTrack.map((v) => ({
          user_id: user.id,
          channel_id: channelRowId,
          platform: "youtube",
          video_id: v.videoId,
          video_url: `https://www.youtube.com/watch?v=${v.videoId}`,
          title: v.title,
          description: v.description ?? null,
          thumbnail: v.thumbnail ?? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          author: v.author ?? null,
          published_at: v.publishedAt ?? null,
          show_in_feed: true,
          show_in_reels: true,
          is_published: true,
          post_id: postByVideoId.get(v.videoId) ?? null,
          published_at_app: new Date().toISOString(),
        })),
      );
      if (trackErr) throw trackErr;
    }
    return Math.max(toAdd.length, toTrack.length);
  }

  async function syncOne(c: UserChannel) {
    setSyncingId(c.id);
    try {
      const res = await importYoutubeChannel({ data: { url: c.channel_url } });
      if ("error" in res) throw new Error(res.error);
      const added = await syncChannelVideos(c.id, res.videos);
      await supabase.from("user_channels").update({ last_synced_at: new Date().toISOString() }).eq("id", c.id);
      toast.success(added > 0 ? `تمت إضافة ${added} فيديو جديد` : "لا فيديوهات جديدة");
      onSynced?.();
    } catch (e: any) {
      toast.error(e.message || "فشل التحديث");
    } finally {
      setSyncingId(null);
    }
  }

  async function removeChannel(id: string) {
    const { error } = await supabase.from("user_channels").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم حذف القناة");
    refetch();
  }

  if (!user) return null;

  return (
    <Card className="p-4 mb-5 bg-[oklch(0.06_0.015_260/0.5)] border-[oklch(1_0_0/0.05)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-bold text-[oklch(0.88_0.03_250)]">قنواتي</h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs">
              <Plus className="h-3.5 w-3.5" />
              إضافة قناة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة قناة YouTube</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/@channelname"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                ستُضاف فيديوهات القناة تلقائياً إلى خلاصتك ويمكن الإعجاب والتعليق عليها.
              </p>
              <Button
                onClick={() => url.trim() && addMutation.mutate(url.trim())}
                disabled={addMutation.isPending || !url.trim()}
                className="w-full gap-1"
              >
                {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                إضافة وجلب الفيديوهات
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {channels.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">لا توجد قنوات بعد. أضف قناة YouTube لتظهر فيديوهاتها هنا.</p>
      ) : (
        <div className="space-y-2">
          {channels.map((c) => (
            <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-[oklch(0.08_0.015_260/0.6)]">
              {c.channel_avatar ? (
                <img src={c.channel_avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                  <Youtube className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{c.channel_name || c.channel_url}</p>
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => syncOne(c)} disabled={syncingId === c.id}>
                {syncingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeChannel(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
