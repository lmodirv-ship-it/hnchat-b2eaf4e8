import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "hn_visitor_session";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function trackVisit() {
  const session_id = getOrCreateSessionId();
  if (!session_id) return;
  // Upsert: insert if new, update last_seen if exists
  await supabase.from("site_visits").upsert(
    {
      session_id,
      last_seen: new Date().toISOString(),
      user_agent: navigator.userAgent.slice(0, 500),
      path: window.location.pathname.slice(0, 200),
    },
    { onConflict: "session_id" }
  );
}

export function VisitorCounter() {
  const { data } = useQuery({
    queryKey: ["visitor-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_visitor_stats");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return {
        online: Number(row?.online_count ?? 0),
        total: Number(row?.total_count ?? 0),
      };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  useEffect(() => {
    trackVisit();
    const interval = setInterval(trackVisit, 60_000); // heartbeat every minute
    return () => clearInterval(interval);
  }, []);

  const online = data?.online ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
        title="Online now"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <Users className="h-3 w-3" />
        <span className="font-semibold tabular-nums">{online.toLocaleString()}</span>
      </div>
      <div
        className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400"
        title="Total visitors"
      >
        <Eye className="h-3 w-3" />
        <span className="font-semibold tabular-nums">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
