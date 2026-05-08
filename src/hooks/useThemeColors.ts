import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useThemeColors() {
  const { user } = useAuth();
  const [bgColor, setBgColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const [btnColor, setBtnColor] = useState("");
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load from DB
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("bg_color, text_color, btn_color")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setBgColor(data.bg_color || "");
          setTextColor(data.text_color || "");
          setBtnColor(data.btn_color || "");
        }
        setLoaded(true);
      });
  }, [user]);

  // Apply CSS vars globally
  useEffect(() => {
    const root = document.documentElement;
    if (bgColor) root.style.setProperty("--theme-bg", bgColor);
    else root.style.removeProperty("--theme-bg");
    if (textColor) root.style.setProperty("--theme-text", textColor);
    else root.style.removeProperty("--theme-text");
    if (btnColor) root.style.setProperty("--theme-btn", btnColor);
    else root.style.removeProperty("--theme-btn");
  }, [bgColor, textColor, btnColor]);

  // Save to DB (debounced)
  const save = useCallback(
    (bg: string, text: string, btn: string) => {
      if (!user || !loaded) return;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        supabase
          .from("profiles")
          .update({ bg_color: bg || null, text_color: text || null, btn_color: btn || null })
          .eq("id", user.id)
          .then(() => {});
      }, 800);
    },
    [user, loaded],
  );

  const setBg = (v: string) => { setBgColor(v); save(v, textColor, btnColor); };
  const setText = (v: string) => { setTextColor(v); save(bgColor, v, btnColor); };
  const setBtn = (v: string) => { setBtnColor(v); save(bgColor, textColor, v); };

  return { bgColor, textColor, btnColor, setBg, setText, setBtn };
}
