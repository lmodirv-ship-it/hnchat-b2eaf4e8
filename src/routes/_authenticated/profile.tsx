import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Pencil, Loader2, LogOut, Shield, Users, FileText, Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, roles, isAdmin, isOwner, signOut } = useAuth();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({ username: "", full_name: "", bio: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ username: profile.username ?? "", full_name: profile.full_name ?? "", bio: profile.bio ?? "" });
  }, [profile]);

  async function uploadImage(file: File, kind: "avatar" | "cover") {
    if (!user) return;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const bucket = kind === "avatar" ? "avatars" : "covers";
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    const update = kind === "avatar" ? { avatar_url: publicUrl } : { cover_url: publicUrl };
    const { error: e2 } = await supabase.from("profiles").update(update).eq("id", user.id);
    if (e2) return toast.error(e2.message);
    toast.success(`${kind === "avatar" ? "صورة" : "غلاف"} مُحدّث`);
    qc.invalidateQueries({ queryKey: ["my-profile", user.id] });
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: form.username.trim(),
        full_name: form.full_name.trim() || null,
        bio: form.bio.trim() || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ الملف الشخصي");
    setEditOpen(false);
    qc.invalidateQueries({ queryKey: ["my-profile", user.id] });
  }

  if (isLoading) {
    return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }

  return (
    <PageShell
      title="My Profile"
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 me-1.5" /> تعديل
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 me-1.5" /> خروج
          </Button>
        </div>
      }
    >
      {/* Cover */}
      <div className="relative h-40 rounded-xl overflow-hidden border border-ice-border bg-gradient-to-br from-cyan-glow/20 via-violet-glow/15 to-pink-glow/20 mb-16">
        {profile?.cover_url && <img src={profile.cover_url} alt="cover" className="w-full h-full object-cover" />}
        <button
          onClick={() => coverInput.current?.click()}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition"
          title="تغيير الغلاف"
        >
          <Camera className="h-4 w-4" />
        </button>
        <input ref={coverInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "cover")} />

        {/* Avatar */}
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-[0_0_30px_oklch(0.78_0.18_220/0.5)]">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-cyan-glow to-violet-glow text-primary-foreground">
                {(profile?.username ?? user?.email ?? "?")[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => avatarInput.current?.click()}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-cyan-glow text-primary-foreground flex items-center justify-center hover:scale-110 transition shadow-lg"
              title="تغيير الصورة"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={avatarInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "avatar")} />
          </div>
        </div>
      </div>

      {/* Identity */}
      <Card className="p-6 mb-6 bg-ice-card border-ice-border">
        <div className="flex flex-wrap items-start gap-4 justify-between">
          <div>
            <h2 className="text-2xl font-bold">{profile?.full_name ?? profile?.username}</h2>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>
            {profile?.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
            <p className="text-xs text-muted-foreground mt-2">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwner && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40"><Shield className="h-3 w-3 me-1" /> Owner</Badge>}
            {isAdmin && !isOwner && <Badge className="bg-pink-glow/20 text-pink-glow border-pink-glow/40">Admin</Badge>}
            {roles.filter((r) => r !== "admin" && r !== "owner").map((r) => (
              <Badge key={r} variant="outline">{r}</Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-ice-border">
          <Stat icon={Users} label="متابعون" value={profile?.followers_count ?? 0} />
          <Stat icon={Users} label="يتابع" value={profile?.following_count ?? 0} />
          <Stat icon={FileText} label="منشور" value={profile?.posts_count ?? 0} />
        </div>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink to="/bookmarks" icon={Heart} label="المحفوظات" />
        <QuickLink to="/groups" icon={Users} label="مجموعاتي" />
        <QuickLink to="/settings" icon={Pencil} label="الإعدادات" />
        <QuickLink to="/preferences" icon={Shield} label="التفضيلات" />
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-popover border-ice-border">
          <DialogHeader><DialogTitle>تعديل الملف الشخصي</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>اسم المستخدم</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" />
            </div>
            <div>
              <Label>الاسم الكامل</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="اسمك الكامل" />
            </div>
            <div>
              <Label>نبذة</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="اكتب نبذة عنك..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={saveProfile} disabled={saving || !form.username.trim()} className="bg-gradient-to-r from-cyan-glow to-violet-glow text-primary-foreground">
              {saving && <Loader2 className="h-4 w-4 me-1.5 animate-spin" />} حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="text-center">
      <Icon className="h-4 w-4 mx-auto mb-1 text-cyan-glow" />
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: any; icon: any; label: string }) {
  return (
    <Link to={to} className="rounded-xl border border-ice-border bg-ice-card p-4 text-center hover:border-cyan-glow/50 hover:shadow-[0_0_20px_oklch(0.78_0.18_220/0.15)] transition-all">
      <Icon className="h-5 w-5 mx-auto mb-2 text-cyan-glow" />
      <div className="text-xs font-medium">{label}</div>
    </Link>
  );
}
