import hnLogoImage from "@/assets/hn-logo.png";

interface HnLogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export function HnLogo({ size = 40, showText = false, subtitle, className }: HnLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-2xl shadow-[0_0_30px_oklch(0.78_0.18_60/0.45),0_0_60px_oklch(0.78_0.18_60/0.15)] ring-2 ring-amber-400/40 transition-all duration-500 hover:shadow-[0_0_40px_oklch(0.78_0.18_60/0.6),0_0_80px_oklch(0.78_0.18_60/0.25)] hover:scale-110"
        style={{ width: size, height: size }}
      >
        <img
          src={hnLogoImage}
          alt="HN-Groupe"
          className="h-full w-full object-cover"
          loading="eager"
        />
        {/* Glow overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/10 via-transparent to-yellow-500/10 pointer-events-none" />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent text-xl font-bold tracking-tight drop-shadow-[0_0_8px_oklch(0.78_0.18_60/0.4)]">
            HN-Groupe
          </div>
          {subtitle && (
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
