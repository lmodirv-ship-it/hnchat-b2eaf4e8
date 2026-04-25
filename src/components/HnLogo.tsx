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
        className="relative flex items-center justify-center overflow-hidden rounded-2xl shadow-[0_0_24px_oklch(0.78_0.18_60/0.35)] ring-1 ring-amber-400/30"
        style={{ width: size, height: size }}
      >
        <img
          src={hnLogoImage}
          alt="HN-Groupe"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent text-xl font-bold tracking-tight">
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
