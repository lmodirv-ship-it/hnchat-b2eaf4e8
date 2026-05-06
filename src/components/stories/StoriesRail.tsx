import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StoryRow {
  id: string;
  user_id: string;
  media_url: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
}
interface ProfileLite {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}
interface StoryGroup {
  user: ProfileLite;
  stories: StoryRow[];
}

export function StoriesRail() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewer, setViewer] = useState<{ groupIdx: number; storyIdx: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const { data: stories } = await supabase
      .from("stories")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (!stories) {
      setGroups([]);
      setLoading(false);
      return;
    }
    const userIds = Array.from(new Set(stories.map((s) => s.user_id)));
    const { data: profiles } = userIds.length
      ? await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", userIds)
      : { data: [] };
    const profMap = new Map((profiles || []).map((p) => [p.id, p as ProfileLite]));

    const grouped: StoryGroup[] = [];
    const seen = new Map<string, number>();
    for (const s of stories) {
      const prof = profMap.get(s.user_id);
      if (!prof) continue;
      let idx = seen.get(s.user_id);
      if (idx === undefined) {
        idx = grouped.length;
        seen.set(s.user_id, idx);
        grouped.push({ user: prof, stories: [] });
      }
      grouped[idx].stories.push(s as StoryRow);
    }
    // Sort each group's stories oldest -> newest for sequential play
    grouped.forEach((g) => g.stories.sort((a, b) => a.created_at.localeCompare(b.created_at)));

    // Put current user's group first if exists
    if (user) {
      const myIdx = grouped.findIndex((g) => g.user.id === user.id);
      if (myIdx > 0) {
        const [mine] = grouped.splice(myIdx, 1);
        grouped.unshift(mine);
      }
    }
    setGroups(grouped);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("stories-rail")
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleUpload(file: File) {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("stories")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("stories").getPublicUrl(path);
      const { error: insErr } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: pub.publicUrl,
        caption: caption.trim() || null,
      });
      if (insErr) throw insErr;
      toast.success("تم نشر القصة! ✨");
      setUploadOpen(false);
      setCaption("");
      load();
    } catch (e: any) {
      toast.error(e?.message || "فشل الرفع");
    } finally {
      setUploading(false);
    }
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
    e.target.value = "";
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {/* Add story button */}
        <button
          onClick={() => setUploadOpen(true)}
          className="shrink-0 flex flex-col items-center gap-1 group"
        >
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-cyan-glow/60 bg-ice-card flex items-center justify-center group-hover:border-cyan-glow transition">
            <Plus className="h-6 w-6 text-cyan-glow" />
          </div>
          <span className="text-[10px] text-muted-foreground">قصتك</span>
        </button>

        {loading && (
          <div className="flex items-center px-4">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-glow" />
          </div>
        )}

        {groups.map((g, gi) => (
          <button
            key={g.user.id}
            onClick={() => setViewer({ groupIdx: gi, storyIdx: 0 })}
            className="shrink-0 flex flex-col items-center gap-1 group"
          >
            <div className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-cyan-glow via-violet-glow to-pink-500">
              <Avatar className="h-full w-full border-2 border-ice-bg">
                <AvatarImage src={g.user.avatar_url || undefined} />
                <AvatarFallback className="bg-cyan-glow/10 text-cyan-glow text-xs">
                  {(g.user.full_name || g.user.username).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-[10px] text-muted-foreground max-w-[64px] truncate">
              {g.user.username}
            </span>
          </button>
        ))}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-ice-card border-ice-border">
          <DialogHeader>
            <DialogTitle>قصة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="تعليق اختياري..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
              className="bg-ice-bg border-ice-border"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileSelected}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-cyan-glow/20 hover:bg-cyan-glow/30 text-cyan-glow border border-cyan-glow/40"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري الرفع...
                </>
              ) : (
                "اختر صورة"
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              تختفي القصة تلقائياً بعد 24 ساعة
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Viewer */}
      {viewer && (
        <StoryViewer
          groups={groups}
          start={viewer}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}

function StoryViewer({
  groups,
  start,
  onClose,
}: {
  groups: StoryGroup[];
  start: { groupIdx: number; storyIdx: number };
  onClose: () => void;
}) {
  const [pos, setPos] = useState(start);
  const [progress, setProgress] = useState(0);

  const group = groups[pos.groupIdx];
  const story = group?.stories[pos.storyIdx];

  function next() {
    if (!group) return onClose();
    if (pos.storyIdx + 1 < group.stories.length) {
      setPos({ groupIdx: pos.groupIdx, storyIdx: pos.storyIdx + 1 });
    } else if (pos.groupIdx + 1 < groups.length) {
      setPos({ groupIdx: pos.groupIdx + 1, storyIdx: 0 });
    } else {
      onClose();
    }
  }

  function prev() {
    if (pos.storyIdx > 0) {
      setPos({ groupIdx: pos.groupIdx, storyIdx: pos.storyIdx - 1 });
    } else if (pos.groupIdx > 0) {
      const prevGroup = groups[pos.groupIdx - 1];
      setPos({
        groupIdx: pos.groupIdx - 1,
        storyIdx: prevGroup.stories.length - 1,
      });
    }
  }

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const duration = 5000;
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / duration) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        next();
      }
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos.groupIdx, pos.storyIdx]);

  if (!story || !group) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-md h-full max-h-[90vh] bg-black overflow-hidden rounded-lg">
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{
                  width:
                    i < pos.storyIdx
                      ? "100%"
                      : i === pos.storyIdx
                      ? `${progress}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-3 right-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-white/40">
              <AvatarImage src={group.user.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-black/50 text-white">
                {(group.user.full_name || group.user.username).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-white text-sm font-medium">{group.user.username}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image */}
        <img
          src={story.media_url}
          alt=""
          className="w-full h-full object-contain"
        />

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-6 left-3 right-3 z-10 text-white text-sm bg-black/40 px-3 py-2 rounded backdrop-blur-sm">
            {story.caption}
          </div>
        )}

        {/* Navigation zones */}
        <button
          onClick={prev}
          className="absolute left-0 top-12 bottom-12 w-1/3 z-10 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition"
          aria-label="السابق"
        >
          <ChevronLeft className="h-8 w-8 text-white/70" />
        </button>
        <button
          onClick={next}
          className={cn(
            "absolute right-0 top-12 bottom-12 w-1/3 z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition",
          )}
          aria-label="التالي"
        >
          <ChevronRight className="h-8 w-8 text-white/70" />
        </button>
      </div>
    </div>
  );
}
