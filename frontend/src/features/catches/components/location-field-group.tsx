import type { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { useEffect, useState } from "react";

import { Button } from "../../../components/ui/button";
import { CatchMap } from "../../maps/components/catch-map";
import type { MapPoint } from "../../maps/lib/map-utils";
import { formatCoordinate } from "../../../lib/formatters";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { CatchFormValues } from "../lib/catch-form-schema";

interface LocationFieldGroupProps {
  register: UseFormRegister<CatchFormValues>;
  errors: FieldErrors<CatchFormValues>;
  selectedPoint: MapPoint | null;
  setValue: UseFormSetValue<CatchFormValues>;
}

export function LocationFieldGroup({
  register,
  errors,
  selectedPoint,
  setValue,
}: LocationFieldGroupProps) {
  const [pendingPoint, setPendingPoint] = useState<MapPoint | null>(null);

  useEffect(() => {
    if (
      pendingPoint &&
      selectedPoint &&
      pendingPoint.lat === selectedPoint.lat &&
      pendingPoint.lon === selectedPoint.lon
    ) {
      setPendingPoint(null);
    }
  }, [pendingPoint, selectedPoint]);

  function handleSelectLocation(point: MapPoint) {
    setPendingPoint(point);
  }

  function handleConfirmLocation() {
    if (!pendingPoint) {
      return;
    }

    setValue("lat", pendingPoint.lat, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue("lon", pendingPoint.lon, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setPendingPoint(null);
  }

  function handleCancelPending() {
    setPendingPoint(null);
  }

  function renderPointLabel(label: string, point: MapPoint | null, emptyText: string) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="mt-2 text-sm font-medium text-foreground">
          {point
            ? `${formatCoordinate(point.lat, "lat")} / ${formatCoordinate(point.lon, "lon")}`
            : emptyText}
        </p>
      </div>
    );
  }

  function hasPendingChange() {
    if (!pendingPoint) {
      return false;
    }

    if (!selectedPoint) {
      return true;
    }

    return pendingPoint.lat !== selectedPoint.lat || pendingPoint.lon !== selectedPoint.lon;
  }

  const showPendingChange = hasPendingChange();

  return (
    <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="text"
            inputMode="decimal"
            placeholder="52.3676"
            {...register("lat")}
          />
          <p className="text-xs text-muted-foreground">
            Use values between -90 and 90.
          </p>
          {errors.lat ? (
            <p className="text-sm text-destructive">{errors.lat.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lon">Longitude</Label>
          <Input
            id="lon"
            type="text"
            inputMode="decimal"
            placeholder="4.9041"
            {...register("lon")}
          />
          <p className="text-xs text-muted-foreground">
            Use values between -180 and 180.
          </p>
          {errors.lon ? (
            <p className="text-sm text-destructive">{errors.lon.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold">Map picker</p>
            <p className="text-sm text-muted-foreground">
              Click the map to preview a new location, then confirm it when it looks right.
            </p>
          </div>
          {showPendingChange ? (
            <div className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-200">
              Pending change
            </div>
          ) : selectedPoint ? (
            <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-primary">
              Location pinned
            </div>
          ) : null}
        </div>
        <CatchMap
          className="h-[320px]"
          emptyMessage="Click anywhere on the map to place your catch location."
          onSelectLocation={handleSelectLocation}
          pendingPoint={showPendingChange ? pendingPoint : null}
          selectedPoint={selectedPoint}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {renderPointLabel("Current place", selectedPoint, "No confirmed location yet.")}
          {renderPointLabel(
            "New place",
            showPendingChange ? pendingPoint : null,
            "Click the map to preview a new location.",
          )}
        </div>
        {showPendingChange ? (
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleConfirmLocation}>
              Confirm new location
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancelPending}>
              Keep current location
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
