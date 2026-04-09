import { Link } from "react-router-dom";
import { Fish, MapPinned, Waves } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { formatCoordinate, formatDateTime } from "../../../lib/formatters";
import type { Catch } from "../../../lib/types";

export function CatchCard({ catchEntry }: { catchEntry: Catch }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-kicker">Logged catch</p>
            <h3 className="mt-2 font-display text-xl font-semibold">
              {catchEntry.species || "Unspecified species"}
            </h3>
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/10 p-3 text-primary">
            <Fish className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-primary" />
            <span>{catchEntry.technique || "Technique not specified"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-primary" />
            <span>
              {formatCoordinate(catchEntry.lat, "lat")} /{" "}
              {formatCoordinate(catchEntry.lon, "lon")}
            </span>
          </div>
          <p>{formatDateTime(catchEntry.timestamp)}</p>
        </div>

        {catchEntry.notes ? (
          <p className="max-h-[4.5rem] overflow-hidden text-sm text-foreground/80">
            {catchEntry.notes}
          </p>
        ) : null}

        <Button asChild variant="secondary" className="w-full">
          <Link to={`/catches/${catchEntry.catch_id}`}>Inspect catch</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
