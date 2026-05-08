/**
 * UserProfileDialog — Quick-look profile popup
 * Shows visitor profile with "Send message" and "Follow / Friend invite" actions.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircle, UserPlus, UserCheck, ExternalLink, Circle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileData {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  followers_count?: number | null;
  following_count?: number | null;
  posts_count?: number | null;
  is_online?: boolean | null;
}

interface Props {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ userId, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState<"msg" | "follow" | null>(null);

  const isMe = user?.id === userId;

  useEffect(() => {
    if (!open || !userId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: rel }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url, bio, followers_count, following_count, posts_count, is_online")
          .eq("id", userId)
          .maybeSingle(),
        user
          ? supabase
              .from("follows")
              .select("id")
              .eq("follower_id", user.id)
              .eq("following_id", userId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (!active) return;
      setProfile(p as ProfileData | null);
      setFollowing(!!rel);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [open, userId, user?.id]);

  async function handleMessage() {
    if (!user || !userId || isMe) return;
    setBusy("msg");
    try {
      const { data: myParts } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);
      const myIds = (myParts || []).map((p) => p.conversation_id);

      let existingId: string | null = null;
      if (myIds.length) {
        const { data: shared } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", userId)
          .in("conversation_id", myIds);
        const ids = (shared || []).map((s) => s.conversation_id);
        if (ids.length) {
          const { data: convs } = await supabase
            .from("conversations")
            .select("id, is_group")
            .in("id", ids)
            .eq("is_group", false);
          if (convs?.length) existingId = convs[0].id;
        }
      }

      if (!existingId) {
        const { data: conv, error } = await supabase
          .from("conversations")
          .insert({ is_group: false })
          .select("id")
          .single();
        if (error || !conv) throw error;
        const { error: pErr } = await supabase
          .from("conversation_participants")
          .insert([
            { conversation_id: conv.id, user_id: user.id },
            { conversation_id: conv.id, user_id: userId },
          ]);
        if (pErr) throw pErr;
        existingId = conv.id;
      }

      onOpenChange(false);
      navigate({ to: "/messages/$conversationId", params: { conversationId: existingId } });
    } catch (e: any) {
      toast.error(e?.message || "تعذر فتح المحادثة");
    } finally {
      setBusy(null);
    }
  }

  async function handleFollow() {
    if (!user || !userId || isMe) return;
    setBusy("follow");
    try {
      if (following) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        setFollowing(false);
        toast.success("تم إلغاء المتابعة");
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: userId });
        if (error) throw error;
        setFollowing(true);
        toast.success("تم إرسال طلب الصداقة / المتابعة");
      }
    } catch (e: any) {
      toast.error(e?.message || "فشل العملية");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-sm bg-[oklch(0.10_0.02_258)] border border-[oklch(1_0_0/0.08)] text-white p-0 overflow-hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>الملف الشخصي</DialogTitle>
        </DialogHeader>

        {/* Cover gradient */}
        <div className="h-20 bg-gradient-to-br from-[oklch(0.32_0.14_220)] via-[oklch(0.26_0.10_240)] to-[oklch(0.18_0.06_260)]" />

        {loading || !profile ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[oklch(0.65_0.15_220)]" />
          </div>
        ) : (
          <div className="px-5 pb-5 -mt-10">
            <div className="flex items-end gap-3">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-[oklch(0.10_0.02_258)] shadow-xl">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xl bg-gradient-to-br from-[oklch(0.30_0.10_230)] to-[oklch(0.22_0.06_245)] text-white">
                    {(profile.full_name || profile.username || "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {profile.is_online && (
                  <Circle className="absolute bottom-1 left-1 h-3.5 w-3.5 fill-green-500 text-green-500 ring-2 ring-[oklch(0.10_0.02_258)] rounded-full" />
                )}
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-base font-bold truncate">
                {profile.full_name || profile.username}
              </h2>
              <p className="text-xs text-[oklch(0.55_0.02_250)] truncate">@{profile.username}</p>
              {profile.bio && (
                <p className="text-[12px] text-[oklch(0.75_0.02_250)] mt-2 leading-relaxed line-clamp-3">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <Stat label="منشورات" value={profile.posts_count ?? 0} />
              <Stat label="متابعون" value={profile.followers_count ?? 0} />
              <Stat label="يتابع" value={profile.following_count ?? 0} />
            </div>

            {/* Actions */}
            {!isMe && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                  onClick={handleMessage}
                  disabled={busy === "msg"}
                  className="bg-gradient-to-br from-[oklch(0.42_0.16_220)] to-[oklch(0.34_0.13_235)] hover:opacity-90 text-white rounded-xl h-10 text-[12.5px] font-semibold"
                >
                  {busy === "msg" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 ml-1.5" />
                      رسالة
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleFollow}
                  disabled={busy === "follow"}
                  variant="outline"
                  className={cn(
                    "rounded-xl h-10 text-[12.5px] font-semibold border",
                    following
                      ? "bg-[oklch(0.16_0.02_258)] border-[oklch(1_0_0/0.10)] text-[oklch(0.65_0.13_150)] hover:bg-[oklch(0.18_0.02_258)]"
                      : "bg-[oklch(0.14_0.04_260)] border-[oklch(0.45_0.15_220/0.4)] text-[oklch(0.78_0.13_220)] hover:bg-[oklch(0.18_0.05_255)]",
                  )}
                >
                  {busy === "follow" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : following ? (
                    <>
                      <UserCheck className="h-4 w-4 ml-1.5" />
                      صديق
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 ml-1.5" />
                      دعوة صداقة
                    </>
                  )}
                </Button>
              </div>
            )}

            <button
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/profile/$username", params: { username: profile.username } });
              }}
              className="w-full mt-2 text-[11.5px] text-[oklch(0.55_0.02_250)] hover:text-[oklch(0.78_0.13_220)] transition flex items-center justify-center gap-1 py-1.5"
            >
              <ExternalLink className="h-3 w-3" />
              عرض الملف الكامل
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[oklch(0.13_0.02_258)] border border-[oklch(1_0_0/0.05)] rounded-xl py-2">
      <p className="text-sm font-bold text-white">{value}</p>
      <p className="text-[10px] text-[oklch(0.55_0.02_250)] mt-0.5">{label}</p>
    </div>
  );
}
