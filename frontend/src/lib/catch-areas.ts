import type { Catch, CatchAreaBucket } from "./types";
import { formatCoordinate } from "./formatters";

function areaKeyFor(value: number) {
  return Math.round(value * 10) / 10;
}

export function buildCatchAreaLabel(lat: number, lon: number) {
  return `${formatCoordinate(lat, "lat")} / ${formatCoordinate(lon, "lon")} area`;
}

export function buildCatchAreaBuckets(catches: Catch[]): CatchAreaBucket[] {
  const buckets = new Map<
    string,
    {
      count: number;
      totalLat: number;
      totalLon: number;
      latestTimestamp: string;
      areaLat: number;
      areaLon: number;
    }
  >();

  catches.forEach((entry) => {
    const areaLat = areaKeyFor(entry.lat);
    const areaLon = areaKeyFor(entry.lon);
    const key = `${areaLat.toFixed(1)}:${areaLon.toFixed(1)}`;
    const current = buckets.get(key);

    if (!current) {
      buckets.set(key, {
        count: 1,
        totalLat: entry.lat,
        totalLon: entry.lon,
        latestTimestamp: entry.timestamp,
        areaLat,
        areaLon,
      });
      return;
    }

    current.count += 1;
    current.totalLat += entry.lat;
    current.totalLon += entry.lon;

    if (new Date(entry.timestamp).getTime() > new Date(current.latestTimestamp).getTime()) {
      current.latestTimestamp = entry.timestamp;
    }
  });

  return [...buckets.entries()]
    .map(([key, bucket]) => ({
      key,
      label: buildCatchAreaLabel(bucket.areaLat, bucket.areaLon),
      count: bucket.count,
      centerLat: bucket.totalLat / bucket.count,
      centerLon: bucket.totalLon / bucket.count,
      latestTimestamp: bucket.latestTimestamp,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
    });
}
