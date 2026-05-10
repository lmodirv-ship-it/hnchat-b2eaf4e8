import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useComposerColor() {
  const { user } = useAuth();
  const [color, setColorState] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const colorRef = useRef(color);
  colorRef.current = color;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("composer_bg_color")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.composer_bg_color) setColorState(data.composer_bg_color);
        setLoaded(true);
      });
  }, [user]);

  const setColor = useCallback((v: string) => {
    setColorState(v);
    colorRef.current = v;
    if (!user || !loaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase
        .from("profiles")
        .update({ composer_bg_color: colorRef.current || null })
        .eq("id", user.id)
        .then(() => {});
    }, 600);
  }, [user, loaded]);

  return { color, setColor };
}
