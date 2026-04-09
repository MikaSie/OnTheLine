import { afterEach, describe, expect, it, vi } from "vitest";

import { getWeatherForecast } from "./weather-api";

describe("getWeatherForecast", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps forecast data into the app weather shape", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          time: ["2026-04-09", "2026-04-10"],
          weather_code: [1, 63],
          temperature_2m_max: [18.2, 11.9],
          wind_speed_10m_max: [14.4, 34.1],
          precipitation_probability_max: [20, 70],
          pressure_msl_mean: [1018.4, 1004.1],
        },
      }),
    } as Response);

    const forecast = await getWeatherForecast({
      latitude: 52.0,
      longitude: 4.0,
      areaLabel: "52.0000° N / 4.0000° E area",
      forecastDays: 14,
    });

    expect(forecast.areaLabel).toBe("52.0000° N / 4.0000° E area");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain("forecast_days=14");
    expect(forecast.entries).toEqual([
      {
        date: "2026-04-09",
        condition: "Partly cloudy",
        temperatureMax: 18.2,
        windSpeedMax: 14.4,
        precipitationProbability: 20,
        pressureMean: 1018.4,
        guidance: "Good",
      },
      {
        date: "2026-04-10",
        condition: "Rain",
        temperatureMax: 11.9,
        windSpeedMax: 34.1,
        precipitationProbability: 70,
        pressureMean: 1004.1,
        guidance: "Poor",
      },
    ]);
  });

  it("throws when the weather payload is incomplete", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          time: ["2026-04-09"],
        },
      }),
    } as Response);

    await expect(
      getWeatherForecast({
        latitude: 52,
        longitude: 4,
        areaLabel: "Test area",
      }),
    ).rejects.toThrow("Weather forecast is incomplete");
  });
});
