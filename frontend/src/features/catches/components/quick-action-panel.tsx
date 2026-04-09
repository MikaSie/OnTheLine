import { Link } from "react-router-dom";
import { Compass, Plus, Radar } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

export function QuickActionPanel() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-kicker">Quick actions</p>
          <h3 className="font-display text-2xl font-semibold">
            Keep the logbook moving
          </h3>
          <p className="text-sm text-muted-foreground">
            Capture a catch fast, scan the log, or drill straight into the latest
            analytical views.
          </p>
        </div>
        <div className="grid gap-3">
          <Button asChild className="justify-start">
            <Link to="/catches/new">
              <Plus className="h-4 w-4" />
              Log a new catch
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link to="/catches">
              <Compass className="h-4 w-4" />
              Open catch log
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link to="/">
              <Radar className="h-4 w-4" />
              Review insights
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
