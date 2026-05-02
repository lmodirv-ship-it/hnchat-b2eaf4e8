import { createFileRoute } from "@tanstack/react-router";
import { fetchSitemapData } from "@/server/public-pages.functions";

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

        const { posts, streams } = await fetchSitemapData();

        const postUrls = posts.map(
          (p) =>
            `<url><loc>${SITE_URL}/post/${p.id}</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
        );

        const liveUrls = streams.map(
          (s) =>
            `<url><loc>${SITE_URL}/live/${s.id}</loc><lastmod>${new Date(s.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
        );

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
