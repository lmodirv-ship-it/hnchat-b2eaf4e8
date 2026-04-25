import { MessageCircle, Zap } from "lucide-react";

interface HnLogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

export function HnLogo({ size = 40, showText = true, subtitle }: HnLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-button glow-cyan"
        style={{ width: size, height: size }}
      >
        <MessageCircle
          className="text-white"
          size={size * 0.55}
          strokeWidth={2.2}
          fill="oklch(0.65 0.25 295 / 0.4)"
        />
        <Zap
          className="absolute -bottom-1 -right-1 text-cyan-glow drop-shadow-[0_0_6px_oklch(0.78_0.18_220)]"
          size={size * 0.4}
          strokeWidth={2.5}
          fill="currentColor"
        />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className="text-gradient text-xl font-bold tracking-tight">hnChat</div>
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
