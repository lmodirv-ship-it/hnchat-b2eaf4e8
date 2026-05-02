import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Crown, Users, FileText, ShoppingBag, Globe, Flag, Power,
  ShieldAlert, Activity, DollarSign, Settings, Search, User,
} from "lucide-react";

const PAGES = [
  { name: "Mission Control", path: "/owner-x9k2m7", icon: Crown },
  { name: "User Operations", path: "/owner-x9k2m7/users", icon: Users },
  { name: "Content & Moderation", path: "/owner-x9k2m7/content", icon: FileText },
  { name: "Commerce & Revenue", path: "/owner-x9k2m7/marketplace", icon: ShoppingBag },
  { name: "Geo & Language", path: "/owner-x9k2m7/geography", icon: Globe },
  { name: "Groups Network", path: "/owner-x9k2m7/groups", icon: Flag },
  { name: "Feature Flags", path: "/owner-x9k2m7/features", icon: Power },
  { name: "Security & RLS", path: "/owner-x9k2m7/security", icon: ShieldAlert },
  { name: "Audit Logs", path: "/owner-x9k2m7/audit", icon: Activity },
  { name: "Finance", path: "/owner-x9k2m7/finance", icon: DollarSign },
  { name: "System Settings", path: "/owner-x9k2m7/settings", icon: Settings },
];

export function OwnerCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // CMD+K / Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search users
  const [q, setQ] = useState("");
  const { data: users } = useQuery({
    queryKey: ["cmd-search-users", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(5);
      return data ?? [];
    },
  });

  const go = useCallback((path: string) => {
    setOpen(false);
    setQ("");
    navigate({ to: path as any });
  }, [navigate]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[oklch(0.2_0.05_30)] bg-[oklch(0.06_0.02_30)] text-[oklch(0.55_0.04_40)] text-xs hover:bg-[oklch(0.08_0.03_30)] hover:text-[oklch(0.75_0.04_40)] transition cursor-pointer"
      >
        <Search className="h-3.5 w-3.5" />
        <span>بحث سريع...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-[oklch(0.2_0.04_30)] bg-[oklch(0.08_0.02_30)] px-1.5 font-mono text-[10px] text-[oklch(0.45_0.04_40)]">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="ابحث عن صفحة أو مستخدم..."
          value={q}
          onValueChange={setQ}
        />
        <CommandList>
          <CommandEmpty>لا توجد نتائج</CommandEmpty>

          <CommandGroup heading="الصفحات">
            {PAGES.map((p) => {
              const Icon = p.icon;
              return (
                <CommandItem key={p.path} onSelect={() => go(p.path)}>
                  <Icon className="h-4 w-4 ml-2 text-[oklch(0.65_0.04_40)]" />
                  <span>{p.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          {users && users.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="المستخدمون">
                {users.map((u) => (
                  <CommandItem key={u.id} onSelect={() => go("/owner-x9k2m7/users")}>
                    <User className="h-4 w-4 ml-2 text-[oklch(0.65_0.04_40)]" />
                    <span>@{u.username}</span>
                    {u.full_name && (
                      <span className="text-xs text-muted-foreground mr-2">{u.full_name}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
