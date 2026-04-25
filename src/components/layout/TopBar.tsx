import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, MessageCircle, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { HnLogo } from "@/components/HnLogo";

export function TopBar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } as any });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <HnLogo className="h-7 w-7" />
          <span className="hidden sm:block font-bold text-sm bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
            hnChat
          </span>
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

        <div className="flex items-center gap-1 shrink-0">
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
