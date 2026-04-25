import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search as SearchIcon, Sparkles, Loader2, Film, Users, ShoppingBag, FileText, User, Hash } from "lucide-react";
import ReactMarkdown from "react-markdown";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  tab: fallback(z.enum(["all", "creators", "people", "posts", "reels", "groups", "products"]), "all").default("all"),
});

export const Route = createFileRoute("/_authenticated/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "بحث موحّد — hnChat" },
      { name: "description", content: "ابحث في كل المحتوى داخل hnChat بمساعدة الذكاء الاصطناعي" },
    ],
  }),
  component: SearchPage,
});

const TAB_ICONS: Record<string, any> = {
  all: SearchIcon, people: User, posts: FileText, reels: Film, groups: Users, products: ShoppingBag,
};

function SearchPage() {
  const { q, tab } = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(q);

  useEffect(() => setInput(q), [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: (prev: any) => ({ ...prev, q: input.trim() }) });
  };

  const setTab = (t: string) => {
    navigate({ to: "/search", search: (prev: any) => ({ ...prev, tab: t }) });
  };

  return (
    <PageShell title="" subtitle="">
      <form onSubmit={submit} className="max-w-3xl mx-auto mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ابحث في كل شيء عبر hnChat..."
            className="pl-12 h-14 text-base rounded-full bg-card border-border/60 shadow-lg"
          />
        </div>
      </form>

      {!q ? (
        <EmptyState onPick={(s) => { setInput(s); navigate({ to: "/search", search: (prev: any) => ({ ...prev, q: s }) }); }} />
      ) : (
        <div className="max-w-4xl mx-auto">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-4">
              {(["all", "people", "posts", "reels", "groups", "products"] as const).map((t) => {
                const Icon = TAB_ICONS[t];
                return (
                  <TabsTrigger key={t} value={t} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {labelFor(t)}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tab === "all" && <AISummary query={q} />}

            <TabsContent value="all" className="space-y-6">
              <PeopleResults q={q} limit={3} />
              <PostsResults q={q} limit={5} />
              <GroupsResults q={q} limit={3} />
              <ProductsResults q={q} limit={4} />
            </TabsContent>
            <TabsContent value="people"><PeopleResults q={q} limit={20} /></TabsContent>
            <TabsContent value="posts"><PostsResults q={q} limit={30} /></TabsContent>
            <TabsContent value="reels"><ReelsResults q={q} limit={20} /></TabsContent>
            <TabsContent value="groups"><GroupsResults q={q} limit={20} /></TabsContent>
            <TabsContent value="products"><ProductsResults q={q} limit={20} /></TabsContent>
          </Tabs>
        </div>
      )}
    </PageShell>
  );
}

function labelFor(t: string) {
  return ({ all: "الكل", people: "أشخاص", posts: "منشورات", reels: "Reels", groups: "مجموعات", products: "منتجات" } as Record<string, string>)[t] ?? t;
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  const trending = ["تصميم", "AI", "ألعاب", "موسيقى", "رياضة", "طبخ", "تقنية", "سفر"];
  return (
    <div className="max-w-3xl mx-auto text-center py-12">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 mb-4">
        <SearchIcon className="h-8 w-8 text-cyan-glow" />
      </div>
      <h2 className="text-2xl font-bold mb-2">ابحث في كل شيء</h2>
      <p className="text-muted-foreground mb-8">أشخاص، منشورات، Reels، مجموعات، منتجات — كل شيء في مكان واحد، بمساعدة AI.</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {trending.map((t) => (
          <button
            key={t}
            onClick={() => onPick(t)}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-card border border-border/60 hover:border-cyan-glow/40 transition text-sm"
          >
            <Hash className="h-3 w-3 text-cyan-glow" />
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ AI Summary (streaming) ============
function AISummary({ query }: { query: string }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aborted = useRef(false);

  useEffect(() => {
    aborted.current = false;
    setText("");
    setError(null);
    setLoading(true);

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-search`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ query }),
    })
      .then(async (resp) => {
        if (!resp.ok || !resp.body) {
          if (resp.status === 429) throw new Error("تم تجاوز حد البحث، حاول بعد قليل.");
          if (resp.status === 402) throw new Error("نفد رصيد AI.");
          throw new Error("فشل البحث الذكي");
        }
        const reader = resp.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          if (aborted.current) break;
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const j = line.slice(6).trim();
            if (j === "[DONE]") return;
            try {
              const p = JSON.parse(j);
              const c = p.choices?.[0]?.delta?.content;
              if (c) setText((t) => t + c);
            } catch {
              buf = line + "\n" + buf;
              break;
            }
          }
        }
      })
      .catch((e) => setError(e.message ?? "خطأ"))
      .finally(() => setLoading(false));

    return () => { aborted.current = true; };
  }, [query]);

  return (
    <Card className="p-5 mb-6 bg-gradient-to-br from-cyan-glow/5 to-violet-glow/5 border-cyan-glow/20">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-cyan-glow" />
        <span className="text-sm font-semibold">إجابة ذكية</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : text ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">يفكّر AI...</p>
      ) : null}
    </Card>
  );
}

// ============ People ============
function PeopleResults({ q, limit }: { q: string; limit: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["search-people", q, limit],
    enabled: !!q,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, bio, is_verified, followers_count")
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(limit);
      return data ?? [];
    },
  });
  return (
    <Section title="أشخاص" icon={User} count={data?.length} loading={isLoading}>
      <div className="grid gap-2 sm:grid-cols-2">
        {data?.map((p) => (
          <Card key={p.id} className="p-3 flex items-center gap-3 hover:border-cyan-glow/40 transition">
            <Avatar className="h-12 w-12">
              <AvatarImage src={p.avatar_url ?? undefined} />
              <AvatarFallback>{p.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.full_name ?? p.username}</div>
              <div className="text-xs text-muted-foreground truncate">@{p.username} · {p.followers_count} متابع</div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ============ Posts ============
function PostsResults({ q, limit }: { q: string; limit: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["search-posts", q, limit],
    enabled: !!q,
    queryFn: async () => {
      const { data: posts } = await supabase
        .from("posts")
        .select("id, content, media_urls, likes_count, comments_count, created_at, user_id, type")
        .neq("type", "short")
        .ilike("content", `%${q}%`)
        .order("created_at", { ascending: false })
        .limit(limit);
      const ids = [...new Set((posts ?? []).map((p) => p.user_id))];
      if (!ids.length) return [];
      const { data: profs } = await supabase.from("profiles").select("id, username, avatar_url").in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return (posts ?? []).map((p) => ({ ...p, profile: map.get(p.user_id) }));
    },
  });
  return (
    <Section title="منشورات" icon={FileText} count={data?.length} loading={isLoading}>
      <div className="space-y-2">
        {data?.map((p) => (
          <Card key={p.id} className="p-3 hover:border-cyan-glow/40 transition">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6"><AvatarImage src={p.profile?.avatar_url ?? undefined} /><AvatarFallback>U</AvatarFallback></Avatar>
              <span className="text-xs font-medium">@{p.profile?.username}</span>
            </div>
            <p className="text-sm line-clamp-2">{p.content}</p>
            <div className="text-xs text-muted-foreground mt-2">{p.likes_count} ❤ · {p.comments_count} 💬</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ============ Reels ============
function ReelsResults({ q, limit }: { q: string; limit: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["search-reels", q, limit],
    enabled: !!q,
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, content, media_urls, likes_count")
        .eq("type", "short")
        .ilike("content", `%${q}%`)
        .limit(limit);
      return data ?? [];
    },
  });
  return (
    <Section title="Reels" icon={Film} count={data?.length} loading={isLoading}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {data?.map((r) => (
          <Link key={r.id} to="/reels" className="aspect-[9/16] rounded-lg bg-black overflow-hidden relative group">
            {r.media_urls?.[0] ? (
              <video src={r.media_urls[0]} className="w-full h-full object-cover" muted />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center"><Film className="h-8 w-8 text-muted-foreground" /></div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
              ❤ {r.likes_count}
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

// ============ Groups ============
function GroupsResults({ q, limit }: { q: string; limit: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["search-groups", q, limit],
    enabled: !!q,
    queryFn: async () => {
      const { data } = await supabase
        .from("groups")
        .select("id, name, slug, description, cover_url, member_count")
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(limit);
      return data ?? [];
    },
  });
  return (
    <Section title="مجموعات" icon={Users} count={data?.length} loading={isLoading}>
      <div className="grid gap-2 sm:grid-cols-2">
        {data?.map((g) => (
          <Card key={g.id} className="p-3 hover:border-cyan-glow/40 transition">
            <div className="font-semibold">{g.name}</div>
            <div className="text-xs text-muted-foreground line-clamp-1">{g.description}</div>
            <div className="text-xs mt-1 text-cyan-glow">{g.member_count} عضو</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ============ Products ============
function ProductsResults({ q, limit }: { q: string; limit: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["search-products", q, limit],
    enabled: !!q,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, title, price, currency, images, category")
        .eq("is_active", true)
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(limit);
      return data ?? [];
    },
  });
  return (
    <Section title="منتجات" icon={ShoppingBag} count={data?.length} loading={isLoading}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data?.map((p) => (
          <Card key={p.id} className="p-2 hover:border-cyan-glow/40 transition">
            <div className="aspect-square rounded bg-muted overflow-hidden mb-2">
              {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />}
            </div>
            <div className="text-xs font-medium line-clamp-1">{p.title}</div>
            <div className="text-sm font-bold text-cyan-glow">{p.price} {p.currency}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Section({ title, icon: Icon, count, loading, children }: any) {
  if (!loading && !count) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-cyan-glow" />
        <h3 className="font-semibold">{title}</h3>
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : (
          <span className="text-xs text-muted-foreground">({count})</span>
        )}
      </div>
      {children}
    </div>
  );
}
