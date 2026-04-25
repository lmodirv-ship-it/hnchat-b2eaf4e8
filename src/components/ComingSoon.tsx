import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  features,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
}) {
  return (
    <div className="rounded-2xl border border-ice-border bg-gradient-to-br from-ice-card via-ice-card to-cyan-glow/5 p-8 md:p-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_oklch(0.78_0.18_220/0.15),_transparent_60%)] pointer-events-none" />
      <div className="relative">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-glow/30 to-violet-glow/20 border border-cyan-glow/40 flex items-center justify-center mb-4 shadow-[0_0_40px_oklch(0.78_0.18_220/0.3)]">
          <Icon className="h-8 w-8 text-cyan-glow" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">{description}</p>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-glow/10 border border-violet-glow/30 text-violet-glow text-xs font-medium mb-6">
          <Sparkles className="h-3 w-3" /> قريباً جداً
        </div>

        {features && features.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-right">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 rounded-lg bg-ice-bg/40 border border-ice-border text-sm"
              >
                <span className="text-cyan-glow mt-0.5">▸</span>
                <span className="text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
