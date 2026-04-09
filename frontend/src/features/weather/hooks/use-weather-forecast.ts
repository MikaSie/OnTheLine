import { useQuery } from "@tanstack/react-query";

import { getWeatherForecast } from "../lib/weather-api";

interface WeatherLocationTarget {
  latitude: number;
  longitude: number;
  areaLabel: string;
}

interface WeatherForecastOptions {
  forecastDays?: number;
}

export function useWeatherForecast(
  location?: WeatherLocationTarget | null,
  options?: WeatherForecastOptions,
) {
  const forecastDays = options?.forecastDays ?? 14;

  return useQuery({
    queryKey: [
      "weather",
      location?.latitude.toFixed(3),
      location?.longitude.toFixed(3),
      location?.areaLabel,
      forecastDays,
    ],
    queryFn: () =>
      getWeatherForecast({
        latitude: location?.latitude ?? 0,
        longitude: location?.longitude ?? 0,
        areaLabel: location?.areaLabel ?? "",
        forecastDays,
      }),
    enabled: Boolean(location),
    staleTime: 1000 * 60 * 30,
  });
}
