import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatchMap } from "./catch-map";

const mapState = {
  handlers: {} as Record<string, ((event: { latlng: { lat: number; lng: number } }) => void) | undefined>,
  fitBounds: vi.fn(),
  setView: vi.fn(),
};

vi.mock("react-leaflet", () => ({
  MapContainer: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="leaflet-map" className={className}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({
    children,
    center,
  }: {
    children?: React.ReactNode;
    center: [number, number];
  }) => (
    <div data-testid="circle-marker">
      {center[0]},{center[1]}
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useMap: () => ({
    fitBounds: mapState.fitBounds,
    setView: mapState.setView,
  }),
  useMapEvents: (handlers: Record<string, (event: { latlng: { lat: number; lng: number } }) => void>) => {
    mapState.handlers = handlers;
    return {};
  },
}));

const catches = [
  {
    catch_id: "catch-1",
    caught_at: "2026-04-09T10:00:00Z",
    lat: 52.3676,
    lon: 4.9041,
    species: "Sea Trout",
    technique_detail: "Spinning",
    notes: "Near structure",
  },
];

describe("CatchMap", () => {
  beforeEach(() => {
    mapState.handlers = {};
    mapState.fitBounds.mockReset();
    mapState.setView.mockReset();
  });

  it("renders popup content for plotted catches", () => {
    render(
      <MemoryRouter>
        <CatchMap catches={catches} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sea Trout")).toBeInTheDocument();
    expect(screen.getByText("Spinning")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open catch" })).toHaveAttribute(
      "href",
      "/catches/catch-1",
    );
  });

  it("shows the empty overlay when no catches are available", () => {
    render(
      <MemoryRouter>
        <CatchMap emptyMessage="No catches yet" />
      </MemoryRouter>,
    );

    expect(screen.getByText("No catches yet")).toBeInTheDocument();
    expect(mapState.setView).toHaveBeenCalledWith([52.1326, 5.2913], 7, {
      animate: false,
    });
  });

  it("emits clicked coordinates through the selection callback", () => {
    const onSelectLocation = vi.fn();

    render(
      <MemoryRouter>
        <CatchMap onSelectLocation={onSelectLocation} />
      </MemoryRouter>,
    );

    mapState.handlers.click?.({ latlng: { lat: 52.1111111, lng: 4.2222222 } });

    expect(onSelectLocation).toHaveBeenCalledWith({
      lat: 52.111111,
      lon: 4.222222,
    });
  });

  it("centers on the selected point when provided", () => {
    render(
      <MemoryRouter>
        <CatchMap selectedPoint={{ lat: 51.9, lon: 4.5 }} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Current location")).toBeInTheDocument();
    expect(mapState.setView).toHaveBeenCalledWith([51.9, 4.5], 12, {
      animate: false,
    });
  });

  it("renders both current and pending markers and prioritizes the pending point for focus", () => {
    render(
      <MemoryRouter>
        <CatchMap
          selectedPoint={{ lat: 51.9, lon: 4.5 }}
          pendingPoint={{ lat: 52.1, lon: 4.8 }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Current location")).toBeInTheDocument();
    expect(screen.getByText("New location")).toBeInTheDocument();
    expect(mapState.setView).toHaveBeenCalledWith([52.1, 4.8], 12, {
      animate: false,
    });
  });

  it("fits bounds when multiple catches are plotted", () => {
    render(
      <MemoryRouter>
        <CatchMap
          catches={[
            ...catches,
            {
              catch_id: "catch-2",
              caught_at: "2026-04-08T10:00:00Z",
              lat: 53.1,
              lon: 5.1,
              species: "Sea Bass",
              technique_detail: "Fly",
              notes: null,
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(mapState.fitBounds).toHaveBeenCalledWith(
      [
        [52.3676, 4.9041],
        [53.1, 5.1],
      ],
      { padding: [28, 28] },
    );
  });

  it("ignores invalid catches for plotting and falls back to the empty state", () => {
    render(
      <MemoryRouter>
        <CatchMap
          catches={[
            {
              catch_id: "invalid",
              caught_at: "2026-04-09T10:00:00Z",
              lat: 150,
              lon: 4.9,
              species: "Impossible",
              technique_detail: null,
              notes: null,
            },
          ]}
          emptyMessage="No valid catches"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("No valid catches")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Open catch" })).not.toBeInTheDocument();
  });
});
