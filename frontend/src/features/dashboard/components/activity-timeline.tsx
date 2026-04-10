import { Activity } from "lucide-react";

import { formatDateTime } from "../../../lib/formatters";
import type { Catch } from "../../../lib/types";

export function ActivityTimeline({ catches }: { catches: Catch[] }) {
  const entries = [...catches]
    .sort((a, b) => new Date(b.caught_at).getTime() - new Date(a.caught_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.catch_id}
          className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/10 p-4"
        >
          <div className="mt-1 rounded-full border border-primary/30 bg-primary/10 p-2 text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              {entry.species || "Unspecified species"}
            </p>
            <p className="text-sm text-muted-foreground">
              {entry.technique_detail || "Technique not specified"} at{" "}
              {entry.lat.toFixed(2)}, {entry.lon.toFixed(2)}
            </p>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {formatDateTime(entry.caught_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
