import { ArrowLeft, PencilLine } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { EmptyState } from "../../../components/common/empty-state";
import { SectionHeader } from "../../../components/common/section-header";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { useToast } from "../../../components/ui/toaster";
import {
  formatCoordinate,
  formatDateTime,
  formatDepthMeters,
  formatLengthCm,
} from "../../../lib/formatters";
import { CatchMap } from "../../maps/components/catch-map";
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
            <ConfirmDialog
              triggerLabel="Delete catch"
              title="Delete this catch?"
              description="This removes the record from the log. Use this only if the entry is incorrect or no longer needed."
              confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
              disabled={deleteMutation.isPending}
              onConfirm={() => deleteMutation.mutate(catchEntry.catch_id)}
            />
          </div>
        }
      />

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Catch map</CardTitle>
            <CardDescription>
              Review the exact logged position directly alongside the rest of the record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CatchMap
              catches={[catchEntry]}
              className="h-[360px]"
              selectedPoint={{ lat: catchEntry.lat, lon: catchEntry.lon }}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Record overview</CardTitle>
            <CardDescription>
              High-confidence metadata for this catch log entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <StatBadge
                label="Latitude"
                value={formatCoordinate(catchEntry.lat, "lat")}
              />
              <StatBadge
                label="Longitude"
                value={formatCoordinate(catchEntry.lon, "lon")}
              />
              <StatBadge
                label="Caught at"
                value={formatDateTime(catchEntry.caught_at)}
              />
              <StatBadge label="Species" value={catchEntry.species || "Unspecified"} />
              <StatBadge
                label="Length"
                value={formatLengthCm(catchEntry.length_cm, "-")}
              />
              <StatBadge
                label="Method"
                value={catchEntry.method_category || "-"}
              />
              <StatBadge
                label="Depth"
                value={formatDepthMeters(catchEntry.depth_m, "-")}
              />
              <StatBadge
                label="Technique"
                value={catchEntry.technique_detail || "-"}
              />
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-kicker">Notes</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/80">
                {catchEntry.notes || "No notes were recorded for this catch."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
