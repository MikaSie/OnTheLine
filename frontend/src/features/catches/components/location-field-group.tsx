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
      <div className="rounded-[1.35rem] border border-white/10 bg-black/25 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
        <p className="mt-3 text-base font-semibold text-foreground md:text-[1.05rem]">
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
    <section className="space-y-4 rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 md:p-6">
      <div className="space-y-2">
        <p className="text-kicker">Location workspace</p>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold">Coordinates and map picker</h3>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Review the current point, preview a new one on the map, and only confirm the change when the location looks right.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.76fr_1.24fr] xl:items-start">
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 md:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Latitude
            </p>
            <Label htmlFor="lat" className="sr-only">
              Latitude
            </Label>
            <Input
              id="lat"
              type="text"
              inputMode="decimal"
              className="mt-3 h-16 rounded-[1.3rem] border-white/10 bg-black/25 px-6 text-[1.12rem] font-semibold md:text-[1.2rem]"
              placeholder="52.3676"
              {...register("lat")}
            />
            <p className="mt-3 text-sm text-muted-foreground">
              Use values between -90 and 90.
            </p>
            {errors.lat ? (
              <p className="mt-2 text-sm text-destructive">{errors.lat.message}</p>
            ) : null}
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 md:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Longitude
            </p>
            <Label htmlFor="lon" className="sr-only">
              Longitude
            </Label>
            <Input
              id="lon"
              type="text"
              inputMode="decimal"
              className="mt-3 h-16 rounded-[1.3rem] border-white/10 bg-black/25 px-6 text-[1.12rem] font-semibold md:text-[1.2rem]"
              placeholder="4.9041"
              {...register("lon")}
            />
            <p className="mt-3 text-sm text-muted-foreground">
              Use values between -180 and 180.
            </p>
            {errors.lon ? (
              <p className="mt-2 text-sm text-destructive">{errors.lon.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <p className="font-display text-xl font-semibold">Map picker</p>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                  Click the map to preview a new location. The current point stays visible until you confirm the new one.
                </p>
              </div>
            </div>
            <CatchMap
              className="mt-4 h-[340px]"
              emptyMessage="Click anywhere on the map to place your catch location."
              onSelectLocation={handleSelectLocation}
              pendingPoint={showPendingChange ? pendingPoint : null}
              selectedPoint={selectedPoint}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.45rem] border border-primary/15 bg-primary/[0.04]">
              {renderPointLabel("Current place", selectedPoint, "No confirmed location yet.")}
            </div>
            <div className="rounded-[1.45rem] border border-cyan-300/15 bg-cyan-400/[0.04]">
              {renderPointLabel(
                "New place",
                showPendingChange ? pendingPoint : null,
                "Click the map to preview a new location.",
              )}
            </div>
          </div>

          {showPendingChange ? (
            <div className="flex flex-wrap gap-3">
              <Button type="button" size="lg" onClick={handleConfirmLocation}>
                Confirm new location
              </Button>
              <Button type="button" size="lg" variant="secondary" onClick={handleCancelPending}>
                Keep current location
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
