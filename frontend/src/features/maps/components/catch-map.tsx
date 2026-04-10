import type { LeafletMouseEvent, LatLngExpression } from "leaflet";
import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Link } from "react-router-dom";

import { cn } from "../../../lib/utils";
import { formatCoordinate, formatDateTime } from "../../../lib/formatters";
import type { Catch } from "../../../lib/types";
import { mapConfig } from "../lib/map-config";
import { toMapPoint, type MapPoint } from "../lib/map-utils";

interface CatchMapProps {
  catches?: Catch[];
  className?: string;
  emptyMessage?: string;
  onSelectLocation?: (point: MapPoint) => void;
  pendingPoint?: MapPoint | null;
  selectedPoint?: MapPoint | null;
}

function MapViewportController({
  catches,
  pendingPoint,
  selectedPoint,
}: {
  catches: Catch[];
  pendingPoint?: MapPoint | null;
  selectedPoint?: MapPoint | null;
}) {
  const map = useMap();

  const markerPoints = useMemo(
    () => catches
      .map((entry) => ({
        catch_id: entry.catch_id,
        point: toMapPoint(entry.lat, entry.lon),
      }))
      .filter((entry): entry is { catch_id: string; point: MapPoint } => entry.point !== null),
    [catches],
  );

  useEffect(() => {
    if (pendingPoint) {
      map.setView([pendingPoint.lat, pendingPoint.lon], mapConfig.focusedZoom, {
        animate: false,
      });
      return;
    }

    if (selectedPoint) {
      map.setView([selectedPoint.lat, selectedPoint.lon], mapConfig.focusedZoom, {
        animate: false,
      });
      return;
    }

    if (markerPoints.length === 0) {
      map.setView(mapConfig.defaultCenter, mapConfig.defaultZoom, { animate: false });
      return;
    }

    if (markerPoints.length === 1) {
      map.setView(
        [markerPoints[0].point.lat, markerPoints[0].point.lon],
        mapConfig.focusedZoom,
        { animate: false },
      );
      return;
    }

    const bounds = markerPoints.map((entry) => [entry.point.lat, entry.point.lon] as [number, number]);
    map.fitBounds(bounds, { padding: [28, 28] });
  }, [map, markerPoints, pendingPoint, selectedPoint]);

  return null;
}

function MapClickHandler({
  onSelectLocation,
}: {
  onSelectLocation?: (point: MapPoint) => void;
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      if (!onSelectLocation) {
        return;
      }

      onSelectLocation(
        toMapPoint(event.latlng.lat, event.latlng.lng) ?? {
          lat: Number(event.latlng.lat.toFixed(6)),
          lon: Number(event.latlng.lng.toFixed(6)),
        },
      );
    },
  });

  return null;
}

export function CatchMap({
  catches = [],
  className,
  emptyMessage,
  onSelectLocation,
  pendingPoint,
  selectedPoint,
}: CatchMapProps) {
  const plottedCatches = useMemo(
    () => catches.filter((entry) => toMapPoint(entry.lat, entry.lon) !== null),
    [catches],
  );
  const center: LatLngExpression = pendingPoint
    ? [pendingPoint.lat, pendingPoint.lon]
    : selectedPoint
      ? [selectedPoint.lat, selectedPoint.lon]
      : mapConfig.defaultCenter;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/70",
        className,
      )}
    >
      <MapContainer
        center={center}
        zoom={pendingPoint || selectedPoint ? mapConfig.focusedZoom : mapConfig.defaultZoom}
        className="h-full min-h-[280px] w-full"
        scrollWheelZoom
      >
        <TileLayer attribution={mapConfig.attribution} url={mapConfig.tileUrl} />
        <MapViewportController
          catches={plottedCatches}
          pendingPoint={pendingPoint}
          selectedPoint={selectedPoint}
        />
        <MapClickHandler onSelectLocation={onSelectLocation} />

        {plottedCatches.map((entry) => (
          <CircleMarker
            key={entry.catch_id}
            center={[entry.lat, entry.lon]}
            radius={8}
            pathOptions={{
              color: "#fb7185",
              weight: 2,
              fillColor: "#c11e31",
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="space-y-2 text-sm text-slate-900">
                <div>
                  <p className="font-semibold">{entry.species || "Unspecified species"}</p>
                  <p className="text-xs text-slate-600">
                    {entry.technique_detail || "Technique not specified"}
                  </p>
                </div>
                <p>{formatDateTime(entry.caught_at)}</p>
                <p>
                  {formatCoordinate(entry.lat, "lat")} / {formatCoordinate(entry.lon, "lon")}
                </p>
                <Link className="font-medium text-rose-700 underline" to={`/catches/${entry.catch_id}`}>
                  Open catch
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {selectedPoint ? (
          <CircleMarker
            center={[selectedPoint.lat, selectedPoint.lon]}
            radius={10}
            pathOptions={{
              color: "#f8fafc",
              weight: 2,
              fillColor: "#0f172a",
              fillOpacity: 0.88,
            }}
          >
            <Popup>
              <div className="space-y-1 text-sm text-slate-900">
                <p className="font-semibold">Current location</p>
                <p>
                  {formatCoordinate(selectedPoint.lat, "lat")} /{" "}
                  {formatCoordinate(selectedPoint.lon, "lon")}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ) : null}

        {pendingPoint ? (
          <CircleMarker
            center={[pendingPoint.lat, pendingPoint.lon]}
            radius={10}
            pathOptions={{
              color: "#67e8f9",
              weight: 2,
              fillColor: "#0891b2",
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="space-y-1 text-sm text-slate-900">
                <p className="font-semibold">New location</p>
                <p>
                  {formatCoordinate(pendingPoint.lat, "lat")} /{" "}
                  {formatCoordinate(pendingPoint.lon, "lon")}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ) : null}
      </MapContainer>

      {!selectedPoint && !pendingPoint && plottedCatches.length === 0 && emptyMessage ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/35 p-6 text-center">
          <div className="max-w-xs rounded-2xl border border-white/10 bg-slate-950/90 px-5 py-4 shadow-panel backdrop-blur">
            <p className="text-sm font-medium text-slate-100">{emptyMessage}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
