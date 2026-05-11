// Generate a friendly, deterministic display name in the viewer's language for
// users that don't have a real name set yet (e.g. "guest_a723fc24").
const NAMES: Record<string, string[]> = {
  ar: [
    "أحمد", "محمد", "علي", "حسن", "يوسف", "خالد", "عمر", "كريم", "سامي", "رامي",
    "سارة", "ليلى", "نور", "هدى", "ريم", "مريم", "آية", "زينب", "ياسمين", "فاطمة",
    "زائر", "ضيف", "صديق", "مسافر", "حالم", "نجم", "قمر", "شمس", "وردة", "أمل",
  ],
  fr: [
    "Léo", "Hugo", "Lucas", "Louis", "Gabriel", "Arthur", "Jules", "Adam", "Raphaël", "Noah",
    "Emma", "Léa", "Chloé", "Manon", "Camille", "Sarah", "Inès", "Louise", "Alice", "Jade",
    "Visiteur", "Invité", "Voyageur", "Étoile", "Soleil", "Rêveur", "Ami", "Nuage", "Phénix", "Aurore",
  ],
  es: [
    "Mateo", "Lucas", "Leo", "Daniel", "Hugo", "Pablo", "Alejandro", "Diego", "Adrián", "Mario",
    "Lucía", "Sofía", "María", "Martina", "Paula", "Julia", "Daniela", "Valeria", "Alba", "Emma",
    "Visitante", "Invitado", "Viajero", "Estrella", "Sol", "Luna", "Amigo", "Nube", "Fénix", "Aurora",
  ],
  en: [
    "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Theo",
    "Olivia", "Emma", "Ava", "Sophia", "Isabella", "Mia", "Luna", "Aria", "Ella", "Nova",
    "Guest", "Visitor", "Wanderer", "Star", "Sun", "Moon", "Friend", "Cloud", "Phoenix", "Dawn",
  ],
};

const SUPPORTED = ["ar", "fr", "es", "en"] as const;
type Lang = (typeof SUPPORTED)[number];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function viewerLanguage(): Lang {
  if (typeof navigator === "undefined") return "ar";
  const code = (navigator.language || "ar").split("-")[0].toLowerCase();
  return (SUPPORTED as readonly string[]).includes(code) ? (code as Lang) : "ar";
}

export function generateDisplayName(seed: string | null | undefined, lang?: Lang): string {
  const language = lang ?? viewerLanguage();
  const list = NAMES[language] ?? NAMES.en;
  const idx = hash(seed ?? "guest") % list.length;
  return list[idx];
}

// Use the real name if present; otherwise build a friendly one from the seed.
export function friendlyName(
  fullName: string | null | undefined,
  username: string | null | undefined,
  seed: string,
  lang?: Lang,
): string {
  const real = (fullName ?? "").trim();
  if (real) return real;
  const u = (username ?? "").trim();
  // Treat auto-generated guest handles as missing.
  if (u && !/^guest[_-]?[a-f0-9]+$/i.test(u) && !/^[a-f0-9]{6,}$/i.test(u)) return u;
  return generateDisplayName(seed, lang);
}
