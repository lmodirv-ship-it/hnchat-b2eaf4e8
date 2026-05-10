import { useState, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Search, Moon, Command, Menu, ChevronDown, Palette, Type, MousePointerClick, PaintBucket, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/lib/auth";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { useLayout } from "@/hooks/useLayoutStore";
import { supabase } from "@/integrations/supabase/client";
import { HnLogo } from "@/components/HnLogo";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useComposerColor } from "@/hooks/useComposerColor";

export function TopBar() {
  const { user } = useAuth();
  const { notifUnread } = useRealtime();
  const { setMobileSidebarOpen } = useLayout();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { bgColor, textColor, btnColor, setBg, setText, setBtn } = useThemeColors();
  const { color: composerBg, setColor: setComposerBg } = useComposerColor();
  const bgRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLInputElement>(null);

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
    <header style={{ backgroundColor: "var(--theme-bg, oklch(0.11 0.02 258 / 0.95))" }} className="shrink-0 h-12 flex items-center border-b border-[oklch(1_0_0/0.07)] backdrop-blur-xl z-30">
      <div className="flex items-center w-full px-3 gap-2">
        {/* Hamburger — mobile */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-1.5 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition"
          aria-label="القائمة"
        >
          <Menu className="h-5 w-5 text-[oklch(0.70_0.02_250)]" />
        </button>

        {/* Logo — mobile only */}
        <Link to="/feed" className="flex items-center gap-1.5 shrink-0 md:hidden">
          <HnLogo size={24} showText={false} />
          <span className="font-bold text-sm text-white">hnChat</span>
          <span className="px-1 py-px rounded text-[7px] font-bold bg-[oklch(0.50_0.18_260)] text-white leading-none">AI+</span>
        </Link>

        {/* Search — centered */}
        <form onSubmit={submit} className={`flex-1 max-w-lg mx-auto transition-all ${searchOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[oklch(0.45_0.02_250)]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث في hnChat"
              className="pr-8 pl-12 h-8 bg-[oklch(0.14_0.02_258)] border-[oklch(1_0_0/0.08)] rounded-lg text-[13px] text-white placeholder:text-[oklch(0.40_0.02_250)] focus:bg-[oklch(0.16_0.02_258)] focus:border-[oklch(0.40_0.08_230/0.4)] transition-colors"
              onBlur={() => { if (!q) setSearchOpen(false); }}
              autoFocus={searchOpen}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[oklch(0.40_0.02_250)]">
              <Command className="h-3 w-3" />
              <span className="text-[10px]">K</span>
            </div>
          </div>
        </form>

        {/* Mobile search toggle */}
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-1.5 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition"
            aria-label="بحث"
          >
            <Search className="h-4.5 w-4.5 text-[oklch(0.60_0.02_250)]" />
          </button>
        )}

        <div className={`flex items-center gap-0.5 shrink-0 ${searchOpen ? 'hidden sm:flex' : 'flex'}`}>
          {/* Refresh */}
          <button
            onClick={() => queryClient.invalidateQueries()}
            className="p-2 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition"
            aria-label="تحديث"
            title="تحديث"
          >
            <RefreshCw className="h-[18px] w-[18px] text-[oklch(0.65_0.02_250)]" />
          </button>

          {/* Composer background color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="p-2 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition relative"
                aria-label="لون خلفية مربع كتابة المنشور"
                title="لون خلفية مربع كتابة المنشور"
              >
                <PaintBucket className="h-[18px] w-[18px] text-[oklch(0.65_0.02_250)]" />
                {composerBg && <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: composerBg }} />}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-3 bg-[oklch(0.08_0.015_260)] border-[oklch(1_0_0/0.08)]">
              <div className="text-[10px] text-[oklch(0.55_0.02_250)] mb-2">لون خلفية مربع المنشور</div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[
                  "oklch(0.06 0.015 260)",
                  "oklch(0.12 0.04 260)",
                  "oklch(0.15 0.06 295)",
                  "oklch(0.14 0.05 160)",
                  "oklch(0.16 0.06 340)",
                  "oklch(0.18 0.04 60)",
                  "oklch(0.1 0.02 220)",
                  "oklch(0.02 0 0)",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setComposerBg(c)}
                    className="h-7 w-7 rounded-full border border-[oklch(1_0_0/0.15)] hover:scale-110 transition-transform"
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setComposerBg("")}
                className="w-full text-[10px] text-[oklch(0.65_0.02_250)] hover:text-[oklch(0.92_0.03_250)] py-1 rounded-md hover:bg-[oklch(1_0_0/0.04)]"
              >
                إعادة تعيين
              </button>
            </PopoverContent>
          </Popover>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition"
            aria-label="الإشعارات"
          >
            <Bell className="h-[18px] w-[18px] text-[oklch(0.65_0.02_250)]" />
            {notifUnread > 0 && (
              <span className="absolute top-0.5 left-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
                {notifUnread > 9 ? "9+" : notifUnread}
              </span>
            )}
          </Link>

          {/* Color customization */}
          <button onClick={() => bgRef.current?.click()} className="p-2 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition relative" aria-label="لون الخلفية" title="لون الخلفية">
            <Palette className="h-[18px] w-[18px] text-[oklch(0.65_0.02_250)]" />
            {bgColor && <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: bgColor }} />}
          </button>
          <input ref={bgRef} type="color" value={bgColor || "#0a0a1a"} onChange={(e) => setBg(e.target.value)} className="sr-only" />

          <button onClick={() => textRef.current?.click()} className="p-2 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition relative" aria-label="لون الكتابة" title="لون الكتابة">
            <Type className="h-[18px] w-[18px] text-[oklch(0.65_0.02_250)]" />
            {textColor && <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: textColor }} />}
          </button>
          <input ref={textRef} type="color" value={textColor || "#e0e0ee"} onChange={(e) => setText(e.target.value)} className="sr-only" />

          <button onClick={() => btnRef.current?.click()} className="p-2 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition relative" aria-label="لون الأزرار" title="لون الأزرار">
            <MousePointerClick className="h-[18px] w-[18px] text-[oklch(0.65_0.02_250)]" />
            {btnColor && <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: btnColor }} />}
          </button>
          <input ref={btnRef} type="color" value={btnColor || "#5ec4ff"} onChange={(e) => setBtn(e.target.value)} className="sr-only" />

          <button className="p-2 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition" aria-label="الوضع الليلي">
            <Moon className="h-[18px] w-[18px] text-[oklch(0.65_0.02_250)]" />
          </button>

          {/* User profile chip */}
          <Link to="/profile" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[oklch(1_0_0/0.06)] transition mr-1">
            <span className="text-[13px] font-medium text-white hidden lg:block">{displayName}</span>
            <Avatar className="h-7 w-7 ring-1 ring-[oklch(1_0_0/0.1)]">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px] bg-[oklch(0.20_0.04_255)] text-[oklch(0.70_0.02_250)]">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-[oklch(0.50_0.02_250)] hidden lg:block" />
          </Link>
        </div>
      </div>
    </header>
  );
}
