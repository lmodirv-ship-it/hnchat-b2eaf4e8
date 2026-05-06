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
import { EnergyModeSelector } from "@/components/layout/EnergyModeSelector";

export function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

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
    if (q.trim()) {
      navigate({ to: "/search", search: { q: q.trim() } as any });
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ice-border/20 bg-background/70 backdrop-blur-3xl backdrop-saturate-[1.8] shadow-[0_4px_30px_oklch(0_0_0/0.3)]">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2">
        {/* Logo — always visible */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0 group">
          <HnLogo size={32} showText={false} />
          <span className="font-extrabold text-sm sm:text-base bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_oklch(0.78_0.18_60/0.3)] group-hover:drop-shadow-[0_0_14px_oklch(0.78_0.18_60/0.5)] transition-all duration-300">
            hnChat
          </span>
        </Link>

        {/* Search — desktop: always shown; mobile: toggle */}
        <form onSubmit={submit} className={`flex-1 max-w-2xl mx-auto transition-all duration-200 ${searchOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في كل شيء..."
              className="pl-9 bg-muted/40 border-border/30 rounded-full h-9 text-sm focus:bg-muted/60"
              onBlur={() => { if (!q) setSearchOpen(false); }}
              autoFocus={searchOpen}
            />
          </div>
        </form>

        {/* Mobile search toggle */}
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-full hover:bg-muted/40 transition active:scale-95"
            aria-label="بحث"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>
        )}

        <div className={`flex items-center gap-1 sm:gap-2 shrink-0 ${searchOpen ? 'hidden sm:flex' : 'flex'}`}>
          <VisitorCounter />
          <Link
            to="/messages"
            className="p-2 rounded-full hover:bg-muted/40 transition active:scale-95 relative"
            aria-label="Messages"
          >
            <MessageCircle className="h-5 w-5" />
          </Link>
          <Link
            to="/notifications"
            className="p-2 rounded-full hover:bg-muted/40 transition active:scale-95 relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-pink-500 ring-2 ring-background" />
          </Link>
          {user && (
            <Link to="/profile" className="ml-0.5">
              <Avatar className="h-8 w-8 ring-2 ring-cyan-glow/30 active:scale-95 transition">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20">
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
