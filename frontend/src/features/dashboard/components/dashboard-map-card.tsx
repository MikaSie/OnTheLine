import { Radar } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import type { Catch } from "../../../lib/types";
import { CatchMap } from "../../maps/components/catch-map";

export function DashboardMapCard({ catches }: { catches: Catch[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-2">
          <CardTitle>Catch positions</CardTitle>
          <CardDescription>
            Every logged catch plotted on an OpenStreetMap layer for quick spatial context.
          </CardDescription>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-primary">
          <Radar className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <CatchMap
          catches={catches}
          className="h-[360px]"
          emptyMessage="No catches have been plotted yet. Log a catch to place your first marker."
        />
      </CardContent>
    </Card>
  );
}
