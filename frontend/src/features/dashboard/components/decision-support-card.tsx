import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import type { InsightStat } from "../../../lib/types";

interface DecisionSupportCardProps {
  insights: InsightStat[];
}

export function DecisionSupportCard({ insights }: DecisionSupportCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-kicker">Decision support</p>
            <h2 className="font-display text-2xl font-semibold">
              What your current log is quietly telling you
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              These signals stay grounded in what is already logged. They summarize recent patterns
              without pretending to predict catch outcomes.
            </p>
          </div>
          <Badge>Based on recent logs</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {insights.map((insight) => (
            <div
              key={insight.label}
              className="rounded-[1.75rem] border border-white/10 bg-black/10 p-5"
            >
              <p className="text-kicker">{insight.label}</p>
              <p className="mt-3 font-display text-2xl font-semibold">{insight.value}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
