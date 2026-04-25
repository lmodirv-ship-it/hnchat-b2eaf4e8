import { MessageCircle, Zap } from "lucide-react";

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
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-glow to-violet-glow shadow-[0_0_24px_oklch(0.78_0.18_220/0.4)]"
        style={{ width: size, height: size }}
      >
        <MessageCircle className="text-primary-foreground" size={size * 0.55} strokeWidth={2.2} />
        <Zap
          className="absolute -bottom-1 -right-1 text-cyan-glow drop-shadow-[0_0_6px_oklch(0.78_0.18_220)]"
          size={size * 0.4}
          strokeWidth={2.5}
          fill="currentColor"
        />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className="bg-gradient-to-r from-cyan-glow to-violet-glow bg-clip-text text-transparent text-xl font-bold tracking-tight">hnChat</div>
          {subtitle && <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{subtitle}</div>}
        </div>
      )}
    </div>
  );
}
