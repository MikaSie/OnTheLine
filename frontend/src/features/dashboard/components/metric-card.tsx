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
      <CardContent className="p-6">
        <div className="mb-5 flex min-h-[3rem] items-start justify-between gap-3">
          <Badge className="flex min-h-[3rem] w-[11rem] items-start px-4 py-2 text-left leading-5">
            {label}
          </Badge>
          <div className="flex h-[3rem] w-[3rem] shrink-0 items-center justify-center rounded-[1.35rem] border border-primary/20 bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
        <div>
          <p className="font-display text-3xl font-semibold md:text-4xl">{value}</p>
          <p className="mt-2 max-w-[13rem] text-sm leading-7 text-muted-foreground">
            {detail}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
