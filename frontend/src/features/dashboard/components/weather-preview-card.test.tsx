import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WeatherPreviewCard } from "./weather-preview-card";

const mockUseWeatherForecast = vi.fn();

vi.mock("../../weather/hooks/use-weather-forecast", () => ({
  useWeatherForecast: (location?: unknown) => mockUseWeatherForecast(location),
}));

const targetArea = {
  key: "52.0:4.0",
  label: "52.0000° N / 4.0000° E area",
  count: 3,
  centerLat: 52.02,
  centerLon: 4.03,
  latestTimestamp: "2026-04-09T10:00:00Z",
};

describe("WeatherPreviewCard", () => {
  it("shows an empty state when no area is available yet", () => {
    mockUseWeatherForecast.mockReturnValue({
      isLoading: false,
      isError: false,
      data: undefined,
    });

    render(<WeatherPreviewCard />);

    expect(screen.getByText("Weather preview is waiting on a fishing area.")).toBeInTheDocument();
  });

  it("renders forecast entries when weather data is available", () => {
    mockUseWeatherForecast.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        areaLabel: targetArea.label,
        entries: Array.from({ length: 8 }, (_, index) => ({
          date: `2026-04-${String(index + 9).padStart(2, "0")}`,
          condition: index === 7 ? "Rain" : "Clear",
          temperatureMax: 18,
          windSpeedMax: 14,
          precipitationProbability: 12,
          pressureMean: 1018,
          guidance: "Good" as const,
        })),
      },
    });

    render(<WeatherPreviewCard targetArea={targetArea} />);

    expect(screen.getByText("Forecast area")).toBeInTheDocument();
    expect(screen.getByText(targetArea.label)).toBeInTheDocument();
    expect(screen.getAllByText("Clear").length).toBeGreaterThan(0);
    expect(screen.getByText(/upcoming 5 days/i)).toBeInTheDocument();
    expect(screen.getAllByText("Pressure").length).toBeGreaterThan(0);
  });

  it("lets the user move between forecast weeks", async () => {
    const user = userEvent.setup();

    mockUseWeatherForecast.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        areaLabel: targetArea.label,
        entries: Array.from({ length: 8 }, (_, index) => ({
          date: `2026-04-${String(index + 9).padStart(2, "0")}`,
          condition: index === 7 ? "Rain" : "Clear",
          temperatureMax: 18,
          windSpeedMax: 14,
          precipitationProbability: 12,
          pressureMean: 1018,
          guidance: "Good" as const,
        })),
      },
    });

    render(<WeatherPreviewCard targetArea={targetArea} />);

    expect(screen.queryByText("Tue, Apr 16")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /next 5 days/i }));
    expect(screen.getByText("Rain")).toBeInTheDocument();
    expect(screen.getByText(/days 6-8/i)).toBeInTheDocument();
  });

  it("shows a calm error state when weather cannot be loaded", () => {
    mockUseWeatherForecast.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    render(<WeatherPreviewCard targetArea={targetArea} />);

    expect(screen.getByText("Weather data is temporarily unavailable.")).toBeInTheDocument();
  });
});
