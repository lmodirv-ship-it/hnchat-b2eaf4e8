import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Search, Moon, Command, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { useLayout } from "@/hooks/useLayoutStore";
import { supabase } from "@/integrations/supabase/client";
import { HnLogo } from "@/components/HnLogo";

export function TopBar() {
  const { user } = useAuth();
  const { notifUnread } = useRealtime();
  const { setMobileSidebarOpen } = useLayout();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["topbar-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url, full_name")
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

  const displayName = profile?.full_name || profile?.username || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-[oklch(0.25_0.03_250/0.25)] bg-[oklch(0.13_0.025_255/0.9)] backdrop-blur-xl">
      <div className="flex items-center h-full px-4 gap-3">
        {/* Hamburger - mobile */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2 -mr-1 rounded-xl hover:bg-[oklch(0.20_0.03_250/0.5)] transition"
          aria-label="القائمة"
        >
          <Menu className="h-5 w-5 text-[oklch(0.75_0.02_250)]" />
        </button>

        {/* Logo - mobile only */}
        <Link to="/" className="flex items-center gap-2 shrink-0 md:hidden">
          <HnLogo size={28} showText={false} />
          <span className="font-bold text-sm text-white">hnChat</span>
          <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-[oklch(0.45_0.15_260)] text-white">AI+</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={submit} className={`flex-1 max-w-xl mx-auto transition-all ${searchOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.50_0.02_250)]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في hnChat"
              className="pr-9 pl-12 bg-[oklch(0.18_0.025_255)] border-[oklch(0.25_0.03_250/0.3)] rounded-xl h-9 text-sm text-white placeholder:text-[oklch(0.45_0.02_250)] focus:bg-[oklch(0.20_0.03_255)] focus:border-[oklch(0.40_0.08_230/0.5)] transition-colors"
              onBlur={() => { if (!q) setSearchOpen(false); }}
              autoFocus={searchOpen}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[oklch(0.45_0.02_250)]">
              <Command className="h-3 w-3" />
              <span className="text-[10px] font-medium">K</span>
            </div>
          </div>
        </form>

        {/* Mobile search toggle */}
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-xl hover:bg-[oklch(0.20_0.03_250/0.5)] transition"
            aria-label="بحث"
          >
            <Search className="h-5 w-5 text-[oklch(0.65_0.02_250)]" />
          </button>
        )}

        <div className={`flex items-center gap-1.5 shrink-0 ${searchOpen ? 'hidden sm:flex' : 'flex'}`}>
          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl hover:bg-[oklch(0.20_0.03_250/0.5)] transition"
            aria-label="الإشعارات"
          >
            <Bell className="h-5 w-5 text-[oklch(0.70_0.02_250)]" />
            {notifUnread > 0 && (
              <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                {notifUnread > 9 ? "9+" : notifUnread}
              </span>
            )}
          </Link>

          {/* Dark mode icon */}
          <button className="p-2 rounded-xl hover:bg-[oklch(0.20_0.03_250/0.5)] transition" aria-label="الوضع الليلي">
            <Moon className="h-5 w-5 text-[oklch(0.70_0.02_250)]" />
          </button>

          {/* Profile */}
          <Link to="/profile" className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-[oklch(0.20_0.03_250/0.5)] transition">
            <span className="text-sm font-medium text-white hidden lg:block">{displayName}</span>
            <Avatar className="h-8 w-8 ring-2 ring-[oklch(0.35_0.08_230/0.4)]">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs bg-[oklch(0.25_0.05_255)] text-white">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
