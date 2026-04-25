import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SITE_URL = "https://www.hnchat.net";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Static high-priority routes
        const staticRoutes = [
          { loc: "/", priority: "1.0", changefreq: "daily" },
          { loc: "/sign-up-login", priority: "0.8", changefreq: "monthly" },
        ];

        // Fetch public posts for dynamic URLs
        let postUrls: string[] = [];
        try {
          const { data: posts } = await supabaseAdmin
            .from("posts")
            .select("id, created_at")
            .order("created_at", { ascending: false })
            .limit(500);

          if (posts) {
            postUrls = posts.map(
              (p: { id: string; created_at: string }) =>
                `<url><loc>${SITE_URL}/post/${p.id}</loc><lastmod>${new Date(p.created_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
            );
          }
        } catch {
          // Ignore — sitemap still works with static routes
        }

        const staticUrls = staticRoutes.map(
          (r) =>
            `<url><loc>${SITE_URL}${r.loc}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("\n")}
${postUrls.join("\n")}
</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
