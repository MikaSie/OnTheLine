import { cn } from "../../lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black shadow-panel">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(193,30,49,0.45),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(193,30,49,0.2),transparent_28%)]" />
        <div className="relative z-10 rounded-full border border-primary/30 bg-primary/15 px-2 py-1 font-display text-base font-semibold tracking-[0.14em] text-primary">
          OTL
        </div>
      </div>
      <div className="min-w-0 space-y-1">
        <p className="font-display text-[1.05rem] font-semibold tracking-[0.22em] text-foreground">
          ONTHELINE
        </p>
        <p className="max-w-[11rem] text-[0.68rem] uppercase leading-5 tracking-[0.24em] text-muted-foreground">
          Premium catch intelligence
        </p>
      </div>
    </div>
  );
}
