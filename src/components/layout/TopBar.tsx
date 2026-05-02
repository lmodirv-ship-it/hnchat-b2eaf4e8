import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, MessageCircle, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { HnLogo } from "@/components/HnLogo";
import { VisitorCounter } from "@/components/layout/VisitorCounter";

export function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["topbar-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } as any });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ice-border/30 bg-background/60 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_4px_30px_oklch(0_0_0/0.3)]">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <HnLogo size={36} showText={false} />
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-extrabold text-base bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_oklch(0.78_0.18_60/0.3)] group-hover:drop-shadow-[0_0_14px_oklch(0.78_0.18_60/0.5)] transition-all duration-300">
              hnChat
            </span>
            <span className="text-[9px] text-muted-foreground tracking-wide">www.hn-chat.com</span>
          </div>
        </Link>

        <form onSubmit={submit} className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في كل شيء..."
              className="pl-9 bg-muted/50 border-border/50 rounded-full h-9"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <VisitorCounter />
          <Link
            to="/messages"
            className="p-2 rounded-full hover:bg-muted transition relative"
            aria-label="Messages"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
          <Link
            to="/notifications"
            className="p-2 rounded-full hover:bg-muted transition relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink-500" />
          </Link>
          {user && (
            <Link to="/profile" className="ml-1">
              <Avatar className="h-8 w-8 ring-2 ring-cyan-glow/30">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback>
                  {(profile?.username ?? user.email ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
