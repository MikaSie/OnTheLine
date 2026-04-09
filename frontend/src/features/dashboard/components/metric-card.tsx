import type { ReactNode } from "react";

import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}

export function MetricCard({ label, value, detail, icon }: MetricCardProps) {
  return (
    <Card className="panel-grid overflow-hidden">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="space-y-3">
          <Badge>{label}</Badge>
          <div>
            <p className="font-display text-3xl font-semibold md:text-4xl">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
