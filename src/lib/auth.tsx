import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { detectAndStoreLocale } from "@/lib/locale";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "admin" | "creator" | "shopper" | "user" | "owner" | "group_admin";

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  isLoading: boolean;
  rolesLoaded: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const uid = newSession.user.id;
        setRolesLoaded(false);
        setTimeout(() => {
          loadRoles(uid).finally(() => setRolesLoaded(true));
          detectAndStoreLocale(uid);
        }, 0);
      } else {
        setRoles([]);
        setRolesLoaded(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const uid = currentSession.user.id;
        loadRoles(uid).finally(() => { setRolesLoaded(true); setIsLoading(false); });
        detectAndStoreLocale(uid);
      } else {
        setRolesLoaded(true);
        setIsLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRoles(userId: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setRoles((data?.map((r) => r.role as AppRole)) ?? []);
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRoles([]);
    // Redirect to landing page
    window.location.href = "/";
  };

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    roles,
    isLoading,
    rolesLoaded,
    isAdmin: roles.includes("admin") || roles.includes("owner"),
    isOwner: roles.includes("owner"),
    isAuthenticated: !!session,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
