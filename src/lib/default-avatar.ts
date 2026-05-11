// Deterministic default avatar (real-looking face) for users without an uploaded photo.
// Each user always gets the same fallback face — they can override it from their profile.
export function getDefaultAvatar(seed: string | null | undefined): string {
  const key = (seed ?? "guest").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "guest";
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(key)}`;
}
