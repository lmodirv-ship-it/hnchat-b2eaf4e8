// SSRF protection helpers: validate that a URL points at a public, routable
// host by resolving DNS (via DoH, works in the Worker runtime) and checking
// the resolved IP addresses against private / reserved ranges.

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "instance-data",
]);

function ipv4ToInt(parts: number[]): number {
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function parseIpv4(host: string): number[] | null {
  // Standard dotted-quad
  const dotted = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (dotted) {
    const parts = dotted.slice(1).map((p) => parseInt(p, 10));
    if (parts.every((p) => p >= 0 && p <= 255)) return parts;
    return null;
  }
  // Decimal / hex / octal notations (e.g. 2130706433, 0x7f000001, 0177.0.0.1)
  const numeric = host.match(/^(0x[0-9a-f]+|0[0-7]*|\d+)$/i);
  if (numeric) {
    const n = host.toLowerCase().startsWith("0x")
      ? parseInt(host, 16)
      : /^0[0-7]+$/.test(host)
        ? parseInt(host, 8)
        : parseInt(host, 10);
    if (!Number.isFinite(n) || n < 0 || n > 0xffffffff) return null;
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  }
  return null;
}

function isPrivateIpv4(parts: number[]): boolean {
  const ip = ipv4ToInt(parts);
  const inRange = (cidr: string) => {
    const [base, bitsStr] = cidr.split("/");
    const bits = parseInt(bitsStr, 10);
    const baseInt = ipv4ToInt(base.split(".").map((p) => parseInt(p, 10)));
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (ip & mask) >>> 0 === (baseInt & mask) >>> 0;
  };
  return [
    "0.0.0.0/8",
    "10.0.0.0/8",
    "100.64.0.0/10",
    "127.0.0.0/8",
    "169.254.0.0/16",
    "172.16.0.0/12",
    "192.0.0.0/24",
    "192.0.2.0/24",
    "192.88.99.0/24",
    "192.168.0.0/16",
    "198.18.0.0/15",
    "198.51.100.0/24",
    "203.0.113.0/24",
    "224.0.0.0/4",
    "240.0.0.0/4",
  ].some(inRange);
}

function isPrivateIpv6(addr: string): boolean {
  const a = addr.toLowerCase().replace(/^\[|\]$/g, "");
  if (a === "::" || a === "::1") return true;
  // IPv4-mapped / compatible: ::ffff:127.0.0.1
  const mapped = a.match(/^::(?:ffff:)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mapped) {
    const parts = parseIpv4(mapped[1]);
    return !parts || isPrivateIpv4(parts);
  }
  // Unique local fc00::/7 (covers fd00::/8), link-local fe80::/10, multicast ff00::/8
  if (/^f[cd]/.test(a)) return true;
  if (/^fe[89ab]/.test(a)) return true;
  if (/^ff/.test(a)) return true;
  return false;
}

function isBlockedLiteral(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTNAMES.has(h)) return true;
  if (h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".localhost")) return true;
  if (h.includes(":")) return isPrivateIpv6(h);
  const v4 = parseIpv4(h);
  if (v4) return isPrivateIpv4(v4);
  return false;
}

async function resolveIps(hostname: string): Promise<string[]> {
  const out: string[] = [];
  for (const type of ["A", "AAAA"]) {
    try {
      const res = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`,
        { headers: { Accept: "application/dns-json" } }
      );
      if (!res.ok) continue;
      const json: any = await res.json();
      for (const ans of json?.Answer ?? []) {
        if (ans?.type === 1 || ans?.type === 28) out.push(String(ans.data));
      }
    } catch {
      /* ignore */
    }
  }
  return out;
}

/**
 * Throws when the URL is not a safe, public http(s) target.
 * Returns the normalized URL string.
 */
export async function assertPublicUrl(input: string): Promise<string> {
  let u: URL;
  try {
    u = new URL(input);
  } catch {
    throw new Error("Invalid URL");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http/https URLs are allowed");
  }
  if (u.username || u.password) {
    throw new Error("Credentials in URL are not allowed");
  }
  const host = u.hostname;
  if (!host || isBlockedLiteral(host)) {
    throw new Error("Private network addresses are not allowed");
  }
  // If it's a literal IP we already validated it; otherwise resolve it.
  const isLiteral = host.includes(":") || parseIpv4(host.replace(/^\[|\]$/g, "")) !== null;
  if (!isLiteral) {
    const ips = await resolveIps(host);
    if (ips.length === 0) throw new Error("Could not resolve host");
    for (const ip of ips) {
      const v4 = parseIpv4(ip);
      const bad = v4 ? isPrivateIpv4(v4) : isPrivateIpv6(ip);
      if (bad) throw new Error("Private network addresses are not allowed");
    }
  }
  return u.toString();
}

/** Non-throwing variant. */
export async function isPublicUrl(input: string): Promise<boolean> {
  try {
    await assertPublicUrl(input);
    return true;
  } catch {
    return false;
  }
}
