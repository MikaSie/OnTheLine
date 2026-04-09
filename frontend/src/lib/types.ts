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
