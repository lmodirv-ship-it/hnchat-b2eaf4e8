import { Link } from "@tanstack/react-router";
import { HnLogo } from "@/components/HnLogo";

const mainLinks = [
  { to: "/feed", label: "الرئيسية" },
  { to: "/explore", label: "استكشاف" },
  { to: "/reels", label: "Reels" },
  { to: "/marketplace", label: "المتجر" },
  { to: "/messages", label: "الرسائل" },
  { to: "/groups", label: "المجموعات" },
] as const;

const moreLinks = [
  { to: "/ai-hub", label: "مركز الذكاء" },
  { to: "/videos", label: "فيديوهات" },
  { to: "/live", label: "بث مباشر" },
  { to: "/games", label: "ألعاب" },
  { to: "/stories", label: "القصص" },
  { to: "/voice", label: "غرف صوتية" },
] as const;

const legalLinks = [
  { to: "/terms", label: "شروط الاستخدام" },
  { to: "/privacy", label: "سياسة الخصوصية" },
  { to: "/about", label: "حول" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="hidden md:block border-t border-border/40 bg-background/60 backdrop-blur-sm mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <HnLogo className="h-8 w-8" />
              <div>
                <div className="font-bold text-sm bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent">
                  hnChat
                </div>
                <div className="text-[10px] text-muted-foreground">www.hn-chat.com</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              منصة سوبر آب تجمع التواصل الاجتماعي، الفيديو، التسوق، والمراسلة في مكان واحد.
            </p>
          </div>

          {/* Main pages */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3">الصفحات الرئيسية</h3>
            <ul className="space-y-1.5">
              {mainLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-muted-foreground hover:text-foreground transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3">المزيد</h3>
            <ul className="space-y-1.5">
              {moreLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-muted-foreground hover:text-foreground transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3">قانوني</h3>
            <ul className="space-y-1.5">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-muted-foreground hover:text-foreground transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/30 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            © {year} hnChat — www.hn-chat.com — جميع الحقوق محفوظة
          </p>
          <a
            href="https://www.hn-chat.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-cyan-glow/70 hover:text-cyan-glow transition"
          >
            www.hn-chat.com
          </a>
        </div>
      </div>
    </footer>
  );
}
