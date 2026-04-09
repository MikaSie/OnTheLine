import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        {kicker ? <p className="text-kicker">{kicker}</p> : null}
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
