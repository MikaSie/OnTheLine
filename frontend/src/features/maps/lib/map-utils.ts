export type MapPoint = {
  lat: number;
  lon: number;
};

function normalizeCoordinate(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim().replace(",", ".");

    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function toMapPoint(
  lat: number | string | null | undefined,
  lon: number | string | null | undefined,
): MapPoint | null {
  const normalizedLat = normalizeCoordinate(lat);
  const normalizedLon = normalizeCoordinate(lon);

  if (normalizedLat === null || normalizedLon === null) {
    return null;
  }

  if (normalizedLat < -90 || normalizedLat > 90) {
    return null;
  }

  if (normalizedLon < -180 || normalizedLon > 180) {
    return null;
  }

  return {
    lat: Number(normalizedLat.toFixed(6)),
    lon: Number(normalizedLon.toFixed(6)),
  };
}
