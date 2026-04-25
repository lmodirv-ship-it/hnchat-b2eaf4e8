import { createServerFn } from "@tanstack/react-start";

export type ScrapedProduct = {
  url: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  images: string[];
  siteName: string;
};

export type ScrapedListItem = {
  url: string;
  title: string;
  image: string | null;
  price: number | null;
  currency: string;
};

function pickMeta(html: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return decodeHtml(m[1].trim());
  }
  return null;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function metaRe(prop: string, attr: "property" | "name" = "property"): RegExp {
  return new RegExp(
    `<meta[^>]+${attr}=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
}
function metaReRev(prop: string, attr: "property" | "name" = "property"): RegExp {
  return new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*${attr}=["']${prop}["']`,
    "i"
  );
}

function extractJsonLd(html: string): any[] {
  const out: any[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(parsed);
    } catch {}
  }
  return out;
}

function findProductJsonLd(blocks: any[]): any | null {
  for (const b of blocks) {
    const items = Array.isArray(b?.["@graph"]) ? b["@graph"] : [b];
    for (const it of items) {
      const t = it?.["@type"];
      if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) return it;
    }
  }
  return null;
}

function absolutize(url: string, base: string): string {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

export const scrapeProductUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    if (!input?.url || typeof input.url !== "string") {
      throw new Error("URL is required");
    }
    let u: URL;
    try {
      u = new URL(input.url);
    } catch {
      throw new Error("Invalid URL");
    }
    if (!["http:", "https:"].includes(u.protocol)) {
      throw new Error("Only http/https URLs are allowed");
    }
    return { url: u.toString() };
  })
  .handler(async ({ data }): Promise<ScrapedProduct> => {
    const res = await fetch(data.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HnBot/1.0; +https://hnchat.lovable.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
    const html = await res.text();

    const jsonLdBlocks = extractJsonLd(html);
    const product = findProductJsonLd(jsonLdBlocks);

    let title =
      product?.name ||
      pickMeta(html, [metaRe("og:title"), metaReRev("og:title"), metaRe("twitter:title", "name")]) ||
      pickMeta(html, [/<title[^>]*>([^<]+)<\/title>/i]) ||
      "";

    let description =
      product?.description ||
      pickMeta(html, [
        metaRe("og:description"),
        metaReRev("og:description"),
        metaRe("description", "name"),
        metaRe("twitter:description", "name"),
      ]) ||
      "";

    const siteName =
      pickMeta(html, [metaRe("og:site_name"), metaReRev("og:site_name")]) ||
      new URL(data.url).hostname;

    // Price + currency
    let price: number | null = null;
    let currency = "USD";
    const offers = product?.offers;
    const offer = Array.isArray(offers) ? offers[0] : offers;
    if (offer) {
      const p = offer.price ?? offer.lowPrice;
      if (p != null) price = parseFloat(String(p));
      if (offer.priceCurrency) currency = String(offer.priceCurrency).toUpperCase();
    }
    if (price == null) {
      const metaPrice = pickMeta(html, [
        metaRe("product:price:amount"),
        metaRe("og:price:amount"),
        metaRe("twitter:data1", "name"),
      ]);
      if (metaPrice) {
        const n = parseFloat(metaPrice.replace(/[^\d.,]/g, "").replace(",", "."));
        if (!isNaN(n)) price = n;
      }
      const metaCur = pickMeta(html, [
        metaRe("product:price:currency"),
        metaRe("og:price:currency"),
      ]);
      if (metaCur) currency = metaCur.toUpperCase();
    }

    // Images
    const images: string[] = [];
    if (product?.image) {
      const imgs = Array.isArray(product.image) ? product.image : [product.image];
      for (const i of imgs) {
        if (typeof i === "string") images.push(absolutize(i, data.url));
        else if (i?.url) images.push(absolutize(i.url, data.url));
      }
    }
    const ogImg = pickMeta(html, [metaRe("og:image"), metaReRev("og:image"), metaRe("twitter:image", "name")]);
    if (ogImg) images.push(absolutize(ogImg, data.url));

    const unique = Array.from(new Set(images)).slice(0, 5);

    return {
      url: data.url,
      title: String(title).slice(0, 200),
      description: String(description).slice(0, 1000),
      price,
      currency,
      images: unique,
      siteName,
    };
  });
