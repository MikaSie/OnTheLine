export interface Catch {
  catch_id: string;
  timestamp: string;
  lat: number;
  lon: number;
  species: string;
  technique: string | null;
  notes: string | null;
}

export interface CreateCatchInput {
  lat: number;
  lon: number;
  species?: string;
  technique?: string | null;
  notes?: string | null;
}

export interface UpdateCatchInput {
  lat?: number;
  lon?: number;
  species?: string;
  technique?: string | null;
  notes?: string | null;
}

export interface DashboardSummary {
  totalCatches: number;
  uniqueSpecies: number;
  techniquesTracked: number;
  latestCatchAt: string | null;
}

export interface DistributionDatum {
  label: string;
  value: number;
}

export interface ActivityDatum {
  date: string;
  catches: number;
}

export interface InsightStat {
  label: string;
  value: string;
  detail: string;
}

export interface CatchAreaBucket {
  key: string;
  label: string;
  count: number;
  centerLat: number;
  centerLon: number;
  latestTimestamp: string;
}

export interface WeatherForecastEntry {
  date: string;
  condition: string;
  temperatureMax: number;
  windSpeedMax: number;
  precipitationProbability: number;
  pressureMean: number;
  guidance: "Good" | "Mixed" | "Poor";
}

export interface WeatherForecast {
  areaLabel: string;
  latitude: number;
  longitude: number;
  entries: WeatherForecastEntry[];
}
