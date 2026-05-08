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

  // Keep refs in sync for save closure
  const bgRef = useRef(bgColor);
  const textRef = useRef(textColor);
  const btnRef = useRef(btnColor);
  bgRef.current = bgColor;
  textRef.current = textColor;
  btnRef.current = btnColor;

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
  const saveToDb = useCallback(() => {
    if (!user || !loaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase
        .from("profiles")
        .update({
          bg_color: bgRef.current || null,
          text_color: textRef.current || null,
          btn_color: btnRef.current || null,
        })
        .eq("id", user.id)
        .then(() => {});
    }, 800);
  }, [user, loaded]);

  const setBg = useCallback((v: string) => { setBgColor(v); bgRef.current = v; saveToDb(); }, [saveToDb]);
  const setText = useCallback((v: string) => { setTextColor(v); textRef.current = v; saveToDb(); }, [saveToDb]);
  const setBtn = useCallback((v: string) => { setBtnColor(v); btnRef.current = v; saveToDb(); }, [saveToDb]);

  return { bgColor, textColor, btnColor, setBg, setText, setBtn };
}
