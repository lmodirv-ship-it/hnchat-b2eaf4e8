import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";
import {
  Loader2, MessageCircle, UserPlus, UserMinus, Settings, Pencil,
  CalendarDays, Users, FileText, ShieldCheck, Eye, EyeOff, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/profile/$username")({
  component: UserProfileByUsername,
});

type PrivacySettings = {
  show_bio: boolean;
  show_posts_count: boolean;
  show_followers_count: boolean;
  show_following_count: boolean;
  show_join_date: boolean;
  show_message_button: boolean;
  show_follow_button: boolean;
  show_posts: boolean;
  show_last_active: boolean;
  show_online_status: boolean;
  show_media: boolean;
  show_groups: boolean;
};

const defaultPrivacy: PrivacySettings = {
  show_bio: true, show_posts_count: true, show_followers_count: true,
  show_following_count: true, show_join_date: true, show_message_button: true,
  show_follow_button: true, show_posts: true, show_last_active: false,
  show_online_status: false, show_media: true, show_groups: false,
};

function UserProfileByUsername() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Fetch profile by username
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-by-username", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, cover_url, bio, is_verified, is_online, created_at, posts_count, followers_count, following_count, last_seen")
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const userId = profile?.id;
  const isMe = user?.id === userId;

  // Fetch privacy settings
  const { data: privacy } = useQuery({
    queryKey: ["profile-privacy", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profile_privacy_settings")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      return (data as PrivacySettings | null) ?? defaultPrivacy;
    },
    enabled: !!userId,
  });

  const p = isMe ? defaultPrivacy : (privacy ?? defaultPrivacy); // owner sees everything

  // Fetch user posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, media_urls, likes_count, comments_count, created_at, user_id")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      if (!data?.length) return [] as FeedPost[];
      const likedSet = new Set<string>();
      if (user) {
        const { data: likes } = await supabase
          .from("likes").select("post_id").eq("user_id", user.id)
          .in("post_id", data.map((x) => x.id));
        (likes ?? []).forEach((l) => likedSet.add(l.post_id));
      }
      return data.map((x) => ({
        ...x,
        profile: profile ? { username: profile.username, full_name: profile.full_name, avatar_url: profile.avatar_url, is_verified: profile.is_verified } : null,
        liked_by_me: likedSet.has(x.id),
      })) as FeedPost[];
    },
    enabled: !!userId && !!profile,
  });

  // Follow status
  const { data: isFollowing } = useQuery({
    queryKey: ["is-following", user?.id, userId],
    queryFn: async () => {
      const { data } = await supabase.from("follows").select("id")
        .eq("follower_id", user!.id).eq("following_id", userId!).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!userId && !isMe,
  });

  const followMut = useMutation({
    mutationFn: async () => {
      if (!user || !userId) throw new Error("Not authenticated");
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: userId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["is-following", user?.id, userId] });
      qc.invalidateQueries({ queryKey: ["profile-by-username", username] });
      toast.success(isFollowing ? "تم إلغاء المتابعة" : "تمت المتابعة ✨");
    },
    onError: (e: any) => toast.error(e.message),
  });

  async function startMessage() {
    if (!user || !userId) return;
    const { data: myConvs } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", user.id);
    const { data: theirConvs } = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", userId);
    const mySet = new Set((myConvs ?? []).map((c) => c.conversation_id));
    const shared = (theirConvs ?? []).find((c) => mySet.has(c.conversation_id));
    if (shared) { navigate({ to: "/messages/$conversationId", params: { conversationId: shared.conversation_id } }); return; }
    const { data: conv, error: ce } = await supabase.from("conversations").insert({ is_group: false }).select("id").single();
    if (ce || !conv) { toast.error("فشل إنشاء المحادثة"); return; }
    await supabase.from("conversation_participants").insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: userId },
    ]);
    navigate({ to: "/messages/$conversationId", params: { conversationId: conv.id } });
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-[oklch(0.78_0.18_220)]" /></div>;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[oklch(0.5_0.03_250)]">المستخدم غير موجود</p>
        <Button asChild variant="outline"><Link to="/feed">العودة للرئيسية</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
      {/* Cover */}
      <div className="relative h-36 sm:h-48 rounded-2xl overflow-hidden mb-16 bg-gradient-to-br from-[oklch(0.78_0.18_220/0.2)] to-[oklch(0.65_0.25_295/0.2)] border border-[oklch(1_0_0/0.05)]">
        {profile.cover_url && <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.03_0.01_260)] to-transparent" />
      </div>

      {/* Avatar + Info */}
      <div className="relative -mt-20 px-4 sm:px-6">
        <div className="flex items-end gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-[oklch(0.03_0.01_260)] shadow-[0_0_30px_oklch(0.78_0.18_220/0.2)]">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[oklch(0.78_0.18_220)] to-[oklch(0.65_0.25_295)] text-xl font-bold text-white">
                {profile.username?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            {p.show_online_status && profile.is_online && (
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-[oklch(0.03_0.01_260)]" />
            )}
          </div>

          <div className="flex-1 flex justify-end gap-2 pb-2">
            {isMe ? (
              <>
                <Button asChild size="sm" variant="outline" className="border-[oklch(1_0_0/0.1)] bg-[oklch(0.06_0.015_260/0.5)]">
                  <Link to="/profile"><Pencil className="h-3.5 w-3.5 mr-1" /> تعديل</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-[oklch(1_0_0/0.1)] bg-[oklch(0.06_0.015_260/0.5)]">
                  <Link to="/settings"><Settings className="h-3.5 w-3.5 mr-1" /> إعدادات</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-[oklch(1_0_0/0.1)] bg-[oklch(0.06_0.015_260/0.5)]">
                  <Link to="/settings" search={{ tab: "privacy" }}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> الخصوصية
                  </Link>
                </Button>
              </>
            ) : (
              <>
                {p.show_follow_button && (
                  <Button
                    size="sm" onClick={() => followMut.mutate()} disabled={followMut.isPending}
                    className={isFollowing
                      ? "bg-[oklch(0.06_0.015_260/0.5)] border border-[oklch(1_0_0/0.1)] text-[oklch(0.8_0.03_250)]"
                      : "bg-gradient-to-r from-[oklch(0.78_0.18_220)] to-[oklch(0.65_0.25_295)] text-white shadow-[0_0_20px_oklch(0.78_0.18_220/0.3)]"}
                  >
                    {followMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isFollowing ? <><UserMinus className="h-3.5 w-3.5 mr-1" /> إلغاء المتابعة</> : <><UserPlus className="h-3.5 w-3.5 mr-1" /> متابعة</>}
                  </Button>
                )}
                {p.show_message_button && (
                  <Button size="sm" variant="outline" onClick={startMessage} className="border-[oklch(1_0_0/0.1)] bg-[oklch(0.06_0.015_260/0.5)]">
                    <MessageCircle className="h-3.5 w-3.5 mr-1" /> رسالة
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Name + username */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[oklch(0.92_0.03_250)]">
              {profile.full_name ?? profile.username}
            </h1>
            {profile.is_verified && <ShieldCheck className="h-5 w-5 text-[oklch(0.78_0.18_220)]" />}
          </div>
          <p className="text-sm text-[oklch(0.5_0.03_250)]">@{profile.username}</p>
        </div>

        {/* Bio */}
        {p.show_bio && profile.bio && (
          <p className="mt-2 text-sm text-[oklch(0.7_0.03_250)] whitespace-pre-wrap">{profile.bio}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 mt-3 text-xs text-[oklch(0.5_0.03_250)]">
          {p.show_join_date && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              انضم {format(new Date(profile.created_at), "MMMM yyyy", { locale: ar })}
            </span>
          )}
          {p.show_online_status && (
            profile.is_online ? (
              <span className="flex items-center gap-1 text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> متصل الآن
              </span>
            ) : p.show_last_active && profile.last_seen ? (
              <span>آخر ظهور: {format(new Date(profile.last_seen), "dd MMM HH:mm", { locale: ar })}</span>
            ) : null
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 py-3 border-t border-b border-[oklch(1_0_0/0.05)]">
          {p.show_posts_count && (
            <div className="text-center">
              <div className="text-lg font-bold text-[oklch(0.9_0.03_250)]">{profile.posts_count ?? 0}</div>
              <div className="text-[10px] text-[oklch(0.5_0.03_250)]">منشور</div>
            </div>
          )}
          {p.show_followers_count && (
            <div className="text-center">
              <div className="text-lg font-bold text-[oklch(0.9_0.03_250)]">{profile.followers_count ?? 0}</div>
              <div className="text-[10px] text-[oklch(0.5_0.03_250)]">متابِع</div>
            </div>
          )}
          {p.show_following_count && (
            <div className="text-center">
              <div className="text-lg font-bold text-[oklch(0.9_0.03_250)]">{profile.following_count ?? 0}</div>
              <div className="text-[10px] text-[oklch(0.5_0.03_250)]">متابَع</div>
            </div>
          )}
        </div>

        {/* Owner preview hint */}
        {isMe && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[oklch(0.5_0.03_250)] bg-[oklch(0.78_0.18_220/0.08)] rounded-lg px-3 py-2 border border-[oklch(0.78_0.18_220/0.15)]">
            <Eye className="h-3.5 w-3.5" />
            <span>أنت ترى صفحتك كاملة. الآخرون يرون فقط ما تسمح به في إعدادات الخصوصية.</span>
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="mt-6 space-y-4 px-2">
        <h2 className="text-sm font-semibold text-[oklch(0.7_0.03_250)] flex items-center gap-2">
          <FileText className="h-4 w-4" /> المنشورات
        </h2>
        {!p.show_posts && !isMe ? (
          <div className="text-center py-12 text-[oklch(0.45_0.03_250)] text-sm flex flex-col items-center gap-2">
            <Lock className="h-6 w-6" />
            <span>هذا المستخدم أخفى منشوراته</span>
          </div>
        ) : (
          <>
            {postsLoading && <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-[oklch(0.78_0.18_220)]" /></div>}
            {!postsLoading && posts.length === 0 && (
              <div className="text-center py-12 text-[oklch(0.45_0.03_250)] text-sm">لا توجد منشورات بعد</div>
            )}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onChange={() => qc.invalidateQueries({ queryKey: ["user-posts", userId] })} />
            ))}
          </>
        )}
      </div>
      <div className="h-8" />
    </div>
  );
}
