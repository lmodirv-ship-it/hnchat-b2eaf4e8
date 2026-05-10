import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

export const Route = createFileRoute("/api/public/articles/$id")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),

      GET: async ({ params }) => {
        const isUuid = /^[0-9a-f-]{36}$/i.test(params.id);
        let q = supabaseAdmin
          .from("articles")
          .select("*, profiles:profiles!articles_author_id_fkey(username, full_name, avatar_url, bio)")
          .eq("status", "published");

        q = isUuid ? q.eq("id", params.id) : q.eq("slug", params.id);
        const { data, error } = await q.maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "not found" }, 404);
        return json({ article: data });
      },
    },
  },
});
