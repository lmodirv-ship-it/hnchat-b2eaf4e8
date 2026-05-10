import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { OwnerShell, OwnerCard, OwnerStat } from "@/components/owner/OwnerShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Database, FileText, Video, Newspaper, Search, Copy, ExternalLink,
  Trash2, Loader2, ChevronLeft, ChevronRight, ImageOff,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_owner/owner/registry")({
  component: RegistryPage,
});

const PAGE_SIZE = 20;

type Kind = "videos" | "articles" | "posts";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("ar", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return d; }
}

function copy(text: string, label = "تم النسخ") {
  navigator.clipboard.writeText(text).then(() => toast.success(label));
}

function Thumb({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="w-16 h-10 rounded-md bg-[oklch(0.1_0.02_260)] border border-[oklch(1_0_0/0.06)] flex items-center justify-center">
        <ImageOff className="h-4 w-4 text-[oklch(0.4_0.03_250)]" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-16 h-10 rounded-md object-cover border border-[oklch(1_0_0/0.06)]"
      loading="lazy"
    />
  );
}

function RegistryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [kind, setKind] = useState<Kind>("videos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data: stats } = useQuery({
    queryKey: ["owner-registry-stats"],
    queryFn: async () => {
      const [v, a, p] = await Promise.all([
        supabase.from("channel_videos").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
      ]);
      return { videos: v.count ?? 0, articles: a.count ?? 0, posts: p.count ?? 0 };
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["owner-registry", kind, search, page],
    queryFn: async () => {
      const s = search.trim();
      const range: [number, number] = [page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1];

      if (kind === "videos") {
        let q = supabase.from("channel_videos").select("*", { count: "exact" })
          .order("created_at", { ascending: false }).range(...range);
        if (s) q = q.or(`short_id.ilike.%${s}%,title.ilike.%${s}%,video_id.ilike.%${s}%`);
        const { data, count } = await q;
        const ids = [...new Set((data ?? []).map(r => r.user_id))];
        const { data: profiles } = ids.length
          ? await supabase.from("profiles").select("id, username, avatar_url").in("id", ids)
          : { data: [] };
        const map = new Map((profiles ?? []).map(p => [p.id, p]));
        return { items: (data ?? []).map(r => ({ ...r, profile: map.get(r.user_id) })), total: count ?? 0 };
      }

      if (kind === "articles") {
        let q = supabase.from("articles").select("*", { count: "exact" })
          .order("created_at", { ascending: false }).range(...range);
        if (s) q = q.or(`short_id.ilike.%${s}%,title.ilike.%${s}%,slug.ilike.%${s}%`);
        const { data, count } = await q;
        const ids = [...new Set((data ?? []).map(r => r.author_id))];
        const { data: profiles } = ids.length
          ? await supabase.from("profiles").select("id, username, avatar_url").in("id", ids)
          : { data: [] };
        const map = new Map((profiles ?? []).map(p => [p.id, p]));
        return { items: (data ?? []).map(r => ({ ...r, profile: map.get(r.author_id) })), total: count ?? 0 };
      }

      let q = supabase.from("posts").select("*", { count: "exact" })
        .order("created_at", { ascending: false }).range(...range);
      if (s) q = q.or(`short_id.ilike.%${s}%,content.ilike.%${s}%`);
      const { data, count } = await q;
      const ids = [...new Set((data ?? []).map(r => r.user_id))];
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id, username, avatar_url").in("id", ids)
        : { data: [] };
      const map = new Map((profiles ?? []).map(p => [p.id, p]));
      return { items: (data ?? []).map(r => ({ ...r, profile: map.get(r.user_id) })), total: count ?? 0 };
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const table = kind === "videos" ? "channel_videos" : kind === "articles" ? "articles" : "posts";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      await supabase.from("owner_audit_logs").insert({
        actor_id: user!.id, action: `${kind}.delete`, target_type: kind, target_id: id,
      });
    },
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["owner-registry"] });
      qc.invalidateQueries({ queryKey: ["owner-registry-stats"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const buildLink = (row: any) => {
    const sid = row.short_id ?? row.id;
    if (kind === "videos") return `/watch-yt/${sid}`;
    if (kind === "articles") return `/blog/${sid}`;
    return `/post/${sid}`;
  };

  const getThumb = (row: any) => {
    if (kind === "videos") return row.thumbnail;
    if (kind === "articles") return row.featured_image;
    return Array.isArray(row.media_urls) && row.media_urls.length ? row.media_urls[0] : null;
  };

  const getTitle = (row: any) => {
    if (kind === "posts") return (row.content ?? "").slice(0, 80) || "(بدون نص)";
    return row.title ?? "(بدون عنوان)";
  };

  const getSource = (row: any) => {
    if (kind === "videos") return row.platform ?? "youtube";
    if (kind === "articles") return row.source_project ?? "internal";
    return row.type ?? "post";
  };

  const getStatus = (row: any) => {
    if (kind === "videos") return row.is_published ? "published" : "draft";
    if (kind === "articles") return row.status;
    return row.is_hidden ? "hidden" : "active";
  };

  return (
    <OwnerShell
      title="سجلّ المحتوى"
      subtitle="جدول موحّد لكل الفيديوهات والمقالات والمنشورات مع المعرّف القصير والإجراءات"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <OwnerStat label="فيديوهات" value={stats?.videos ?? "…"} icon={Video} accent="cyan" />
        <OwnerStat label="مقالات" value={stats?.articles ?? "…"} icon={Newspaper} accent="amber" />
        <OwnerStat label="منشورات" value={stats?.posts ?? "…"} icon={FileText} accent="rose" />
      </div>

      <OwnerCard className="p-5" glow="cyan">
        <Tabs value={kind} onValueChange={(v) => { setKind(v as Kind); setPage(0); }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <TabsList>
              <TabsTrigger value="videos"><Video className="h-3.5 w-3.5 ml-1" /> فيديوهات</TabsTrigger>
              <TabsTrigger value="articles"><Newspaper className="h-3.5 w-3.5 ml-1" /> مقالات</TabsTrigger>
              <TabsTrigger value="posts"><FileText className="h-3.5 w-3.5 ml-1" /> منشورات</TabsTrigger>
            </TabsList>
            <div className="relative w-full md:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث: short_id، عنوان…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pr-9"
              />
            </div>
          </div>

          <TabsContent value={kind} className="mt-0">
            <div className="overflow-x-auto rounded-xl border border-[oklch(1_0_0/0.06)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">ID</TableHead>
                    <TableHead className="w-44">التاريخ</TableHead>
                    <TableHead className="w-24">المصدر</TableHead>
                    <TableHead className="w-20">الصورة</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead className="w-32">المالك</TableHead>
                    <TableHead className="w-24">الحالة</TableHead>
                    <TableHead className="w-40 text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow><TableCell colSpan={8} className="text-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin inline" />
                    </TableCell></TableRow>
                  )}
                  {!isLoading && (data?.items ?? []).length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      لا يوجد محتوى
                    </TableCell></TableRow>
                  )}
                  {(data?.items ?? []).map((row: any) => {
                    const sid = row.short_id ?? "—";
                    const link = buildLink(row);
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <button
                            onClick={() => copy(sid, "تم نسخ المعرّف")}
                            className="font-mono text-xs px-2 py-1 rounded bg-[oklch(0.1_0.02_260)] hover:bg-[oklch(0.15_0.03_260)] transition"
                          >
                            {sid}
                          </button>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">
                          {fmtDate(row.created_at)}
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{getSource(row)}</Badge></TableCell>
                        <TableCell><Thumb src={getThumb(row)} alt={sid} /></TableCell>
                        <TableCell className="max-w-[280px] truncate text-sm">{getTitle(row)}</TableCell>
                        <TableCell className="text-xs">
                          {row.profile?.username ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">{getStatus(row)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 justify-end">
                            <Button size="icon" variant="ghost" title="معاينة" onClick={() => window.open(link, "_blank")}>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" title="نسخ الرابط" onClick={() => copy(`${origin}${link}`, "تم نسخ الرابط")}>
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon" variant="ghost" title="حذف"
                              onClick={() => { if (confirm("حذف نهائي؟")) del.mutate(row.id); }}
                              disabled={del.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-muted-foreground">
                {data?.total ?? 0} عنصر — صفحة {page + 1} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </OwnerCard>
    </OwnerShell>
  );
}
