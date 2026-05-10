import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-blog-secret",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

export const Route = createFileRoute("/api/public/articles")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),

      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
        const language = url.searchParams.get("language");
        const source = url.searchParams.get("source");

        let q = supabaseAdmin
          .from("articles")
          .select("id, title, slug, short_description, featured_image, content, language, tags, reading_time, views_count, likes_count, published_at, source_project, source_url, external_id, author_id, profiles:profiles!articles_author_id_fkey(username, full_name, avatar_url)")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(limit);

        if (language) q = q.eq("language", language);
        if (source) q = q.eq("source_project", source);

        const { data, error } = await q;
        if (error) return json({ error: error.message }, 500);

        return json({ articles: data, hub: "https://hn-chat.com" });
      },

      POST: async ({ request }) => {
        const secret = request.headers.get("x-blog-secret");
        const { data: settings } = await supabaseAdmin
          .from("app_settings")
          .select("value")
          .eq("key", "cross_project_blog_secret")
          .maybeSingle();

        const expected = (settings?.value as any)?.token;
        if (!expected || secret !== expected) {
          return json({ error: "unauthorized" }, 401);
        }

        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "invalid json" }, 400);
        }

        const required = ["title", "source_project", "external_id"];
        for (const k of required) {
          if (!payload[k]) return json({ error: `missing ${k}` }, 400);
        }

        // Find or use a service author profile (first owner)
        const { data: ownerProfile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .limit(1)
          .maybeSingle();

        if (!ownerProfile) return json({ error: "no author available" }, 500);

        const slug =
          payload.slug ??
          (payload.title as string)
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 80) + "-" + payload.external_id.slice(0, 8);

        const row = {
          author_id: ownerProfile.id,
          title: payload.title,
          slug,
          short_description: payload.short_description ?? null,
          content: payload.content ?? null,
          featured_image: payload.featured_image ?? null,
          language: payload.language ?? "ar",
          tags: payload.tags ?? [],
          status: "published" as const,
          published_at: payload.published_at ?? new Date().toISOString(),
          source_project: payload.source_project,
          source_url: payload.source_url ?? null,
          external_id: payload.external_id,
          reading_time: payload.reading_time ?? 1,
        };

        const { data, error } = await supabaseAdmin
          .from("articles")
          .upsert(row, { onConflict: "source_project,external_id" })
          .select()
          .single();

        if (error) return json({ error: error.message }, 500);
        return json({ article: data }, 201);
      },
    },
  },
});
