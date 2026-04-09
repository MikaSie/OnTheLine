import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CloudRain, CloudSun, Compass, Gauge, Wind } from "lucide-react";

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  formatDayMonthShort,
  formatPercentage,
  formatPressure,
  formatTemperature,
  formatWeekdayShort,
  formatWindSpeed,
} from "../../../lib/formatters";
import type { CatchAreaBucket } from "../../../lib/types";
import { useWeatherForecast } from "../../weather/hooks/use-weather-forecast";

const DAYS_PER_PAGE = 5;

interface WeatherPreviewCardProps {
  targetArea?: CatchAreaBucket | null;
}

export function WeatherPreviewCard({ targetArea }: WeatherPreviewCardProps) {
  const [page, setPage] = useState(0);

  const weatherQuery = useWeatherForecast(
    targetArea
      ? {
          latitude: targetArea.centerLat,
          longitude: targetArea.centerLon,
          areaLabel: targetArea.label,
        }
      : null,
    { forecastDays: 14 },
  );

  const forecastEntries = weatherQuery.data?.entries ?? [];
  const totalPages = Math.max(1, Math.ceil(forecastEntries.length / DAYS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleEntries = useMemo(
    () =>
      forecastEntries.slice(
        currentPage * DAYS_PER_PAGE,
        currentPage * DAYS_PER_PAGE + DAYS_PER_PAGE,
      ),
    [currentPage, forecastEntries],
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-2">
          <CardTitle>Upcoming weather</CardTitle>
          <CardDescription>
            A longer-range planning view for your most active recent area. Guidance is based only on
            wind, rain chance, and temperature, not catch prediction.
          </CardDescription>
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-3 text-primary">
          <CloudSun className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {!targetArea ? (
          <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-black/10 p-6">
            <p className="font-medium">Weather preview is waiting on a fishing area.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Once a few catches are logged, this panel will use your busiest area as a simple forecast
              anchor.
            </p>
          </div>
        ) : weatherQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-[1.75rem]" />
            <div className="grid gap-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-52 w-full rounded-[1.75rem]" />
              ))}
            </div>
          </div>
        ) : weatherQuery.isError ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-black/10 p-6">
            <p className="font-medium">Weather data is temporarily unavailable.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your catch insights are still available. Reload later to refresh the forecast for this
              area.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-black/10 p-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-3">
                <p className="text-kicker">Forecast area</p>
                <p className="font-display text-3xl font-semibold">
                  {weatherQuery.data?.areaLabel}
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Compass className="h-4 w-4 text-primary" />
                  Based on your most repeated recent location cluster
                </div>
              </div>
              <div className="flex flex-wrap items-start justify-end gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((value) => Math.max(0, value - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous 5 days
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next 5 days
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-kicker">Forecast window</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {currentPage === 0
                    ? "Upcoming 5 days."
                    : `Days ${currentPage * DAYS_PER_PAGE + 1}-${Math.min(
                        forecastEntries.length,
                        currentPage * DAYS_PER_PAGE + DAYS_PER_PAGE,
                      )}.`}{" "}
                  Use the 5-day switcher to scan farther ahead when you are planning days off.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {visibleEntries.map((entry) => (
                <div
                  key={entry.date}
                  className="flex min-h-[20rem] flex-col rounded-[1.75rem] border border-white/10 bg-black/10 p-5"
                >
                  <div className="min-h-[5.5rem] space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                      {formatWeekdayShort(entry.date)}
                    </p>
                    <p className="font-display text-[2rem] font-semibold leading-[0.95] tracking-[-0.04em]">
                      {formatDayMonthShort(entry.date)}
                    </p>
                  </div>

                  <div className="min-h-[2.5rem]">
                    <p className="text-lg text-muted-foreground">{entry.condition}</p>
                  </div>

                  <div className="mt-6 grid gap-3 text-sm">
                    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 text-muted-foreground">
                      <CloudSun className="h-4 w-4 text-primary" />
                      <span className="whitespace-nowrap">Temp</span>
                      <span className="text-right font-medium text-foreground">
                        {formatTemperature(entry.temperatureMax)}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 text-muted-foreground">
                      <Wind className="h-4 w-4 text-primary" />
                      <span className="whitespace-nowrap">Wind</span>
                      <span className="text-right font-medium text-foreground">
                        {formatWindSpeed(entry.windSpeedMax)}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 text-muted-foreground">
                      <CloudRain className="h-4 w-4 text-primary" />
                      <span className="whitespace-nowrap">Rain chance</span>
                      <span className="text-right font-medium text-foreground">
                        {formatPercentage(entry.precipitationProbability)}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 text-muted-foreground">
                      <Gauge className="h-4 w-4 text-primary" />
                      <span className="whitespace-nowrap">Pressure</span>
                      <span className="text-right font-medium text-foreground">
                        {formatPressure(entry.pressureMean)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
