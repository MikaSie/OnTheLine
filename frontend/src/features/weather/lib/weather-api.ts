import type { WeatherForecast, WeatherForecastEntry } from "../../../lib/types";

interface WeatherForecastParams {
  latitude: number;
  longitude: number;
  areaLabel: string;
  forecastDays?: number;
}

interface OpenMeteoResponse {
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    wind_speed_10m_max?: number[];
    precipitation_probability_max?: number[];
    pressure_msl_mean?: number[];
  };
}

function describeWeatherCode(code: number) {
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Storms";
  return "Variable";
}

function buildGuidance(entry: {
  temperatureMax: number;
  windSpeedMax: number;
  precipitationProbability: number;
}): WeatherForecastEntry["guidance"] {
  if (
    entry.precipitationProbability <= 25 &&
    entry.windSpeedMax <= 20 &&
    entry.temperatureMax >= 8 &&
    entry.temperatureMax <= 24
  ) {
    return "Good";
  }

  if (entry.precipitationProbability <= 55 && entry.windSpeedMax <= 30) {
    return "Mixed";
  }

  return "Poor";
}

export async function getWeatherForecast({
  latitude,
  longitude,
  areaLabel,
  forecastDays = 14,
}: WeatherForecastParams): Promise<WeatherForecast> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "wind_speed_10m_max",
      "precipitation_probability_max",
      "pressure_msl_mean",
    ].join(","),
  );
  url.searchParams.set("forecast_days", String(forecastDays));
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Weather forecast is unavailable");
  }

  const payload = (await response.json()) as OpenMeteoResponse;
  const daily = payload.daily;

  if (
    !daily?.time ||
    !daily.weather_code ||
    !daily.temperature_2m_max ||
    !daily.wind_speed_10m_max ||
    !daily.precipitation_probability_max ||
    !daily.pressure_msl_mean
  ) {
    throw new Error("Weather forecast is incomplete");
  }

  const entries = daily.time.map((date, index) => {
    const mapped = {
      date,
      condition: describeWeatherCode(daily.weather_code?.[index] ?? -1),
      temperatureMax: daily.temperature_2m_max?.[index] ?? 0,
      windSpeedMax: daily.wind_speed_10m_max?.[index] ?? 0,
      precipitationProbability: daily.precipitation_probability_max?.[index] ?? 0,
      pressureMean: daily.pressure_msl_mean?.[index] ?? 0,
    };

    return {
      ...mapped,
      guidance: buildGuidance(mapped),
    };
  });

  return {
    areaLabel,
    latitude,
    longitude,
    entries,
  };
}
