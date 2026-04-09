import type { ReactNode } from "react";

import { Card, CardContent } from "../ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="panel-grid overflow-hidden">
      <CardContent className="flex flex-col items-start gap-6 py-12">
        <div className="space-y-3">
          <p className="text-kicker">No entries yet</p>
          <h3 className="font-display text-2xl font-semibold">{title}</h3>
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
