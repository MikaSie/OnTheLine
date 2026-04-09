import { cn } from "../../lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black shadow-panel">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(193,30,49,0.45),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(193,30,49,0.2),transparent_28%)]" />
        <div className="relative z-10 rounded-full border border-primary/30 bg-primary/15 px-2 py-1 font-display text-lg font-semibold tracking-[0.18em] text-primary">
          OTL
        </div>
      </div>
      <div>
        <p className="font-display text-lg font-semibold tracking-[0.18em] text-foreground">
          ONTHELINE
        </p>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Premium catch intelligence
        </p>
      </div>
    </div>
  );
}
