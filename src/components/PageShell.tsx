import type { ReactNode } from "react";

export function PageShell({ title, subtitle, action, children }: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-cyan-glow bg-clip-text text-transparent">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}
