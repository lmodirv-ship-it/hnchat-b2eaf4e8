import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = "https://www.hnchat.net";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Only include publicly accessible routes (no auth required)
        const staticRoutes = [
          { loc: "/", priority: "1.0", changefreq: "daily" },
          { loc: "/sign-up-login", priority: "0.8", changefreq: "monthly" },
        ];

        const urls = staticRoutes.map(
          (r) =>
            `<url><loc>${SITE_URL}${r.loc}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
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
