import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "hn_visitor_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}

/**
 * Tracks the current visitor in site_visits table.
 * On first visit (new session), inserts a row → triggers owner notification.
 * On subsequent navigations, updates last_seen and path.
 */
export function useVisitorTracking(path?: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentPath = path || window.location.pathname;
    const sessionId = getSessionId();
    if (!sessionId) return;

    const track = async () => {
      try {
        // Try to update existing session
        const { data: existing } = await supabase
          .from("site_visits")
          .select("id")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (existing) {
          // Update last_seen and path
          await supabase
            .from("site_visits")
            .update({
              last_seen: new Date().toISOString(),
              path: currentPath,
            })
            .eq("session_id", sessionId);
        } else {
          // New visitor — insert (triggers notification to owner)
          await supabase.from("site_visits").insert({
            session_id: sessionId,
            path: currentPath,
            user_agent: navigator.userAgent,
            device_type: getDeviceType(),
            referrer: document.referrer || null,
          });
        }
      } catch {
        // Silent fail — tracking shouldn't break the app
      }
    };

    track();
  }, [path]);
}
