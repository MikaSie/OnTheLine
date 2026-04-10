import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardPage } from "./dashboard-page";

const mockUseCatches = vi.fn();
const mockDashboardMapCard = vi.fn(
  ({ catches }: { catches: { catch_id: string }[] }) => (
    <div data-testid="dashboard-map-card">Mapped catches: {catches.length}</div>
  ),
);

vi.mock("../../catches/hooks/use-catches", () => ({
  useCatches: () => mockUseCatches(),
}));

vi.mock("../components/dashboard-map-card", () => ({
  DashboardMapCard: (props: { catches: { catch_id: string }[] }) => mockDashboardMapCard(props),
}));

vi.mock("../components/weather-preview-card", () => ({
  WeatherPreviewCard: ({
    targetArea,
  }: {
    targetArea?: { label: string } | null;
  }) => <div data-testid="weather-preview-card">Weather target: {targetArea?.label ?? "none"}</div>,
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  CartesianGrid: () => null,
}));

const catches = [
  {
    catch_id: "1",
    caught_at: "2026-04-09T10:00:00Z",
    lat: 52.0,
    lon: 4.0,
    species: "Sea Trout",
    technique_detail: "Spinning",
    notes: "Rocks",
  },
  {
    catch_id: "2",
    caught_at: "2026-04-08T10:00:00Z",
    lat: 52.1,
    lon: 4.1,
    species: "Sea Bass",
    technique_detail: "Fly",
    notes: "Harbor",
  },
];

describe("DashboardPage", () => {
  beforeEach(() => {
    mockUseCatches.mockReset();
    mockDashboardMapCard.mockClear();
    mockUseCatches.mockReturnValue({
      isLoading: false,
      isError: false,
      data: catches,
    });
  });

  it("renders summary metrics from catches", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Premium catch intelligence for anglers who want a sharper edge."),
    ).toBeInTheDocument();
    expect(screen.getByText("Species recorded")).toBeInTheDocument();
    expect(screen.getByText("Techniques tracked")).toBeInTheDocument();
    expect(screen.getByText("What your current log is quietly telling you")).toBeInTheDocument();
    expect(screen.getByText("Top species lately")).toBeInTheDocument();
    expect(screen.getByText("Most used technique")).toBeInTheDocument();
    expect(screen.getAllByText(/^2$/)).toHaveLength(5);
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-map-card")).toHaveTextContent("Mapped catches: 2");
    expect(screen.getByTestId("weather-preview-card")).toHaveTextContent("Weather target:");
  });

  it("shows the error state when catches cannot be loaded", () => {
    mockUseCatches.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard data is unavailable")).toBeInTheDocument();
  });

  it("shows standby insight readiness when there are no catches", () => {
    mockUseCatches.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Standby")).toBeInTheDocument();
    expect(screen.getByText("Awaiting first catch")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-map-card")).toHaveTextContent("Mapped catches: 0");
  });
});
