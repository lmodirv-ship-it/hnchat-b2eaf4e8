import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SITE_URL = "https://www.hnchat.net";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticRoutes = [
          { loc: "/", priority: "1.0", changefreq: "daily" },
          { loc: "/about", priority: "0.8", changefreq: "monthly" },
          { loc: "/contact", priority: "0.7", changefreq: "monthly" },
          { loc: "/privacy", priority: "0.5", changefreq: "yearly" },
          { loc: "/terms", priority: "0.5", changefreq: "yearly" },
          { loc: "/sign-up-login", priority: "0.7", changefreq: "monthly" },
        ];

        let postUrls: string[] = [];
        try {
          const { data: posts } = await supabaseAdmin
            .from("posts")
            .select("id, updated_at")
            .order("created_at", { ascending: false })
            .limit(1000);
          if (posts) {
            postUrls = posts.map(
              (p: { id: string; updated_at: string }) =>
                `<url><loc>${SITE_URL}/post/${p.id}</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
            );
          }
        } catch {
          // ignore
        }

        let liveUrls: string[] = [];
        try {
          const { data: streams } = await supabaseAdmin
            .from("live_streams")
            .select("id, updated_at")
            .eq("is_private", false)
            .order("created_at", { ascending: false })
            .limit(500);
          if (streams) {
            liveUrls = streams.map(
              (s: { id: string; updated_at: string }) =>
                `<url><loc>${SITE_URL}/live/${s.id}</loc><lastmod>${new Date(s.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
            );
          }
        } catch {
          // ignore
        }

        const staticUrls = staticRoutes.map(
          (r) =>
            `<url><loc>${SITE_URL}${r.loc}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("\n")}
${postUrls.join("\n")}
${liveUrls.join("\n")}
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
