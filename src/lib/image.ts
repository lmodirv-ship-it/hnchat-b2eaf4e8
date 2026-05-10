/**
 * Supabase Storage image transformation helper.
 * Adds width / quality / format parameters so we don't ship 1920×1080 images
 * to a 414×276 thumbnail slot.
 *
 * Only rewrites URLs hosted on the project's Supabase storage. Other URLs
 * (YouTube thumbnails, external CDNs, blob:, data:, local imports) are
 * returned unchanged.
 */
const SUPABASE_HOST_RE = /\.supabase\.co\/storage\/v1\/object\/public\//;

export function optimizedImage(
  src: string | null | undefined,
  opts: { width?: number; quality?: number; format?: "webp" | "origin" } = {},
): string {
  if (!src || typeof src !== "string") return src ?? "";
  if (!SUPABASE_HOST_RE.test(src)) return src;

  // Use Supabase image transform endpoint: /render/image/public/ instead of /object/public/
  const transformed = src.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/",
  );

  const params = new URLSearchParams();
  if (opts.width) params.set("width", String(opts.width));
  params.set("quality", String(opts.quality ?? 75));
  if (opts.format !== "origin") params.set("format", opts.format ?? "origin");
  params.set("resize", "cover");

  const sep = transformed.includes("?") ? "&" : "?";
  return `${transformed}${sep}${params.toString()}`;
}
