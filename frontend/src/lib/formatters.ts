export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDayLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatWeekdayShort(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(new Date(value));
}

export function formatDayMonthShort(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function formatCoordinate(value: number, axis: "lat" | "lon") {
  const direction =
    axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";

  return `${Math.abs(value).toFixed(4)}° ${direction}`;
}

export function formatPercentage(value: number) {
  return `${Math.round(value)}%`;
}

export function formatWindSpeed(value: number) {
  return `${Math.round(value)} km/h`;
}

export function formatTemperature(value: number) {
  return `${Math.round(value)}°C`;
}

export function formatPressure(value: number) {
  return `${Math.round(value)} hPa`;
}

export function formatLengthCm(value?: number | null, emptyLabel = "Not specified") {
  if (value === null || value === undefined) {
    return emptyLabel;
  }

  return `${value.toFixed(1)} cm`;
}

export function formatDepthMeters(value?: number | null, emptyLabel = "Not specified") {
  if (value === null || value === undefined) {
    return emptyLabel;
  }

  return `${value.toFixed(1)} m`;
}
