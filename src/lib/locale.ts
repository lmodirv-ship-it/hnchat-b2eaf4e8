import { supabase } from "@/integrations/supabase/client";

export async function detectAndStoreLocale(userId: string) {
  try {
    // Don't overwrite if already set manually
    const { data: existing } = await supabase
      .from("profiles")
      .select("country_code, language_code, locale_source")
      .eq("id", userId)
      .single();

    if (existing?.locale_source === "manual" && existing.country_code) return existing;

    const language = (navigator.language || "en").split("-")[0].toLowerCase();
    let country: string | null = null;

    // Try to extract from navigator.language e.g. "ar-MA"
    const parts = (navigator.language || "").split("-");
    if (parts[1]) country = parts[1].toUpperCase();

    // Fallback: free IP geolocation (no key required)
    if (!country) {
      try {
        const r = await fetch("https://ipapi.co/json/", { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          if (j.country_code) country = String(j.country_code).toUpperCase();
        }
      } catch {}
    }

    await supabase.from("profiles").update({
      country_code: country,
      language_code: language,
      locale_source: existing?.locale_source === "manual" ? "manual" : "auto",
    }).eq("id", userId);

    return { country_code: country, language_code: language };
  } catch (e) {
    console.warn("locale detection failed", e);
    return null;
  }
}

export const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", FR: "France", DE: "Germany",
  MA: "Morocco", EG: "Egypt", SA: "Saudi Arabia", AE: "UAE", DZ: "Algeria",
  TN: "Tunisia", JO: "Jordan", LB: "Lebanon", SY: "Syria", IQ: "Iraq",
  YE: "Yemen", QA: "Qatar", KW: "Kuwait", BH: "Bahrain", OM: "Oman",
  TR: "Turkey", IN: "India", CN: "China", JP: "Japan", BR: "Brazil",
  CA: "Canada", AU: "Australia", ES: "Spain", IT: "Italy", RU: "Russia",
};

export const LANGUAGE_NAMES: Record<string, string> = {
  ar: "العربية", en: "English", fr: "Français", es: "Español",
  de: "Deutsch", tr: "Türkçe", ru: "Русский", zh: "中文", ja: "日本語",
  hi: "हिन्दी", pt: "Português", it: "Italiano",
};
