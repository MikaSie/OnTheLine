import { ArrowLeft, PencilLine } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { EmptyState } from "../../../components/common/empty-state";
import { SectionHeader } from "../../../components/common/section-header";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { useToast } from "../../../components/ui/toaster";
import { formatCoordinate, formatDateTime } from "../../../lib/formatters";
import { useCatch, useDeleteCatch } from "../hooks/use-catches";
import { ConfirmDialog } from "../components/confirm-dialog";
import { StatBadge } from "../components/stat-badge";

export function CatchDetailPage() {
  const { catchId = "" } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const catchQuery = useCatch(catchId);
  const deleteMutation = useDeleteCatch({
    onSuccess: () => {
      pushToast({
        title: "Catch deleted",
        description: "The record was removed from the log.",
      });
      navigate("/catches");
    },
  });

  if (catchQuery.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (catchQuery.isError || !catchQuery.data) {
    return (
      <EmptyState
        title="Catch not found"
        description="This record could not be loaded. It may have been removed or the link may be incorrect."
        action={
          <Button asChild>
            <Link to="/catches">Back to catch log</Link>
          </Button>
        }
      />
    );
  }

  const catchEntry = catchQuery.data;

  return (
    <div className="space-y-6">
      <SectionHeader
        kicker="Catch detail"
        title={catchEntry.species || "Unspecified species"}
        description="Inspect the full record, review location details, and make safe updates when needed."
        action={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/catches">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/catches/${catchEntry.catch_id}/edit`}>
                <PencilLine className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Record overview</CardTitle>
            <CardDescription>
              High-confidence metadata for this catch log entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <StatBadge label="Species" value={catchEntry.species || "Unspecified"} />
              <StatBadge
                label="Technique"
                value={catchEntry.technique || "Unspecified"}
              />
              <StatBadge
                label="Latitude"
                value={formatCoordinate(catchEntry.lat, "lat")}
              />
              <StatBadge
                label="Longitude"
                value={formatCoordinate(catchEntry.lon, "lon")}
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-kicker">Logged at</p>
              <p className="mt-3 font-display text-2xl font-semibold">
                {formatDateTime(catchEntry.timestamp)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-kicker">Notes</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/80">
                {catchEntry.notes || "No notes were recorded for this catch."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record actions</CardTitle>
            <CardDescription>
              Keep the log accurate without losing clarity over destructive changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to={`/catches/${catchEntry.catch_id}/edit`}>Open editor</Link>
            </Button>
            <ConfirmDialog
              triggerLabel="Delete catch"
              title="Delete this catch?"
              description="This removes the record from the log. Use this only if the entry is incorrect or no longer needed."
              confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
              disabled={deleteMutation.isPending}
              onConfirm={() => deleteMutation.mutate(catchEntry.catch_id)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
