import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Settings as SettingsIcon, User, Globe, LogOut, Shield, Moon, Eye, EyeOff } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) ?? undefined,
  }),
});

type PrivacyKey =
  | "show_bio" | "show_posts_count" | "show_followers_count" | "show_following_count"
  | "show_join_date" | "show_message_button" | "show_follow_button" | "show_posts"
  | "show_last_active" | "show_online_status" | "show_media" | "show_groups";

const privacyLabels: { key: PrivacyKey; ar: string; en: string }[] = [
  { key: "show_bio", ar: "النبذة التعريفية", en: "Bio" },
  { key: "show_posts", ar: "المنشورات", en: "Posts" },
  { key: "show_posts_count", ar: "عدد المنشورات", en: "Posts count" },
  { key: "show_followers_count", ar: "عدد المتابعين", en: "Followers count" },
  { key: "show_following_count", ar: "عدد المتابَعين", en: "Following count" },
  { key: "show_join_date", ar: "تاريخ الانضمام", en: "Join date" },
  { key: "show_online_status", ar: "حالة الاتصال", en: "Online status" },
  { key: "show_last_active", ar: "آخر نشاط", en: "Last active" },
  { key: "show_message_button", ar: "زر الرسائل", en: "Message button" },
  { key: "show_follow_button", ar: "زر المتابعة", en: "Follow button" },
  { key: "show_media", ar: "الوسائط", en: "Media" },
  { key: "show_groups", ar: "المجموعات", en: "Groups" },
];

function SettingsPage() {
  const { user, isAdmin, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const showPrivacy = search.tab === "privacy";
  const [activeTab, setActiveTab] = useState<"general" | "privacy">(showPrivacy ? "privacy" : "general");

  useEffect(() => { if (showPrivacy) setActiveTab("privacy"); }, [showPrivacy]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-glow/30 to-violet-glow/20 border border-cyan-glow/40 flex items-center justify-center">
          <SettingsIcon className="h-6 w-6 text-cyan-glow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-sm text-muted-foreground">إدارة حسابك وتفضيلاتك العامة.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[oklch(1_0_0/0.05)] pb-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "general" ? "bg-[oklch(0.78_0.18_220/0.15)] text-[oklch(0.78_0.18_220)] border-b-2 border-[oklch(0.78_0.18_220)]" : "text-muted-foreground hover:text-foreground"}`}
        >
          <User className="h-3.5 w-3.5 inline mr-1" /> عام
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "privacy" ? "bg-[oklch(0.78_0.18_220/0.15)] text-[oklch(0.78_0.18_220)] border-b-2 border-[oklch(0.78_0.18_220)]" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Eye className="h-3.5 w-3.5 inline mr-1" /> الخصوصية
        </button>
      </div>

      {activeTab === "general" ? (
        <>
          <section className="rounded-xl border border-ice-border bg-ice-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
              <User className="h-4 w-4 text-cyan-glow" /> الحساب
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">البريد الإلكتروني</dt>
                <dd className="font-medium">{user?.email ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">الدور</dt>
                <dd className="font-medium flex items-center gap-1">
                  {isAdmin && <Shield className="h-3 w-3 text-pink-glow" />}
                  {isAdmin ? "Admin" : roles[0] ?? "user"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-ice-border bg-ice-card p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Moon className="h-4 w-4 text-violet-glow" /> المظهر
            </h2>
            <p className="text-xs text-muted-foreground">التطبيق يستخدم وضعاً داكناً مع تدرّجات Cyan/Violet.</p>
          </section>

          <section className="rounded-xl border border-ice-border bg-ice-card p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Globe className="h-4 w-4 text-cyan-glow" /> اللغة
            </h2>
            <p className="text-xs text-muted-foreground">العربية (افتراضي) — مزيد من اللغات قريباً.</p>
          </section>

          <button
            onClick={async () => { await signOut(); navigate({ to: "/sign-up-login" }); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium"
          >
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </button>
        </>
      ) : (
        <PrivacySettingsSection userId={user?.id} />
      )}
    </div>
  );
}

function PrivacySettingsSection({ userId }: { userId?: string }) {
  const qc = useQueryClient();

  const { data: privacy, isLoading } = useQuery({
    queryKey: ["my-privacy-settings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("profile_privacy_settings")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      return data;
    },
  });

  async function toggle(key: PrivacyKey, value: boolean) {
    if (!userId) return;
    const { error } = await supabase
      .from("profile_privacy_settings")
      .update({ [key]: value })
      .eq("user_id", userId);
    if (error) {
      toast.error("فشل حفظ الإعدادات");
      return;
    }
    qc.setQueryData(["my-privacy-settings", userId], (old: any) => old ? { ...old, [key]: value } : old);
    qc.invalidateQueries({ queryKey: ["profile-privacy", userId] });
    toast.success("تم حفظ إعدادات الخصوصية");
  }

  if (isLoading) return <div className="text-center py-8"><span className="text-sm text-muted-foreground">جارٍ التحميل...</span></div>;

  if (!privacy) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        لا توجد إعدادات خصوصية. جاري الإنشاء...
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-ice-border bg-ice-card p-5 space-y-1">
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-4">
        <Eye className="h-4 w-4 text-cyan-glow" /> خصوصية الملف الشخصي
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        تحكّم فيما يراه الآخرون عند زيارة صفحتك الشخصية.
      </p>
      <div className="space-y-3">
        {privacyLabels.map(({ key, ar, en }) => (
          <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[oklch(1_0_0/0.03)] transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{ar}</span>
              <span className="text-[10px] text-muted-foreground">{en}</span>
            </div>
            <Switch
              checked={!!(privacy as any)[key]}
              onCheckedChange={(v) => toggle(key, v)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
