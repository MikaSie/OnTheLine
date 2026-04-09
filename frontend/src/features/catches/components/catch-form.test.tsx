import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CatchForm } from "./catch-form";

const mockCatchMap = vi.fn(
  ({
    onSelectLocation,
    pendingPoint,
    selectedPoint,
  }: {
    onSelectLocation?: (point: { lat: number; lon: number }) => void;
    pendingPoint?: { lat: number; lon: number } | null;
    selectedPoint?: { lat: number; lon: number } | null;
  }) => (
    <div>
      <div data-testid="selected-point">
        {selectedPoint ? `${selectedPoint.lat},${selectedPoint.lon}` : "none"}
      </div>
      <div data-testid="pending-point">
        {pendingPoint ? `${pendingPoint.lat},${pendingPoint.lon}` : "none"}
      </div>
      <button
        type="button"
        onClick={() => onSelectLocation?.({ lat: 53.123456, lon: 6.654321 })}
      >
        Pick location on map
      </button>
    </div>
  ),
);

vi.mock("../../maps/components/catch-map", () => ({
  CatchMap: (props: {
    onSelectLocation?: (point: { lat: number; lon: number }) => void;
    pendingPoint?: { lat: number; lon: number } | null;
    selectedPoint?: { lat: number; lon: number } | null;
  }) => mockCatchMap(props),
}));

describe("CatchForm", () => {
  it("submits coordinates entered with decimal commas", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CatchForm
        mode="create"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Latitude"), "52,3676");
    await user.type(screen.getByLabelText("Longitude"), "4,9041");
    await user.type(screen.getByLabelText("Species"), "Sea Trout");
    await user.click(screen.getByRole("button", { name: "Log catch" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);

    const [submittedValues] = onSubmit.mock.calls[0];

    expect(submittedValues).toEqual(
      expect.objectContaining({
        lat: 52.3676,
        lon: 4.9041,
        species: "Sea Trout",
      }),
    );
  });

  it("stages a location picked on the map until it is confirmed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CatchForm
        mode="create"
        isSubmitting={false}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Pick location on map" }));
    expect(screen.getByTestId("selected-point")).toHaveTextContent("none");
    expect(screen.getByTestId("pending-point")).toHaveTextContent("53.123456,6.654321");
    expect(screen.getByText("Current place")).toBeInTheDocument();
    expect(screen.getByText("New place")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm new location" }));
    await user.type(screen.getByLabelText("Species"), "Sea Bass");
    await user.click(screen.getByRole("button", { name: "Log catch" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: 53.123456,
        lon: 6.654321,
        species: "Sea Bass",
      }),
      expect.anything(),
    );
  });

  it("syncs the selected marker when coordinates are typed manually", async () => {
    const user = userEvent.setup();

    render(
      <CatchForm
        mode="create"
        isSubmitting={false}
        onSubmit={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText("Latitude"), "52.5");
    await user.type(screen.getByLabelText("Longitude"), "4.7");

    expect(screen.getByTestId("selected-point")).toHaveTextContent("52.5,4.7");
  });

  it("starts with the saved point when editing an existing catch", () => {
    render(
      <CatchForm
        mode="edit"
        isSubmitting={false}
        onSubmit={vi.fn()}
        initialValues={{
          catch_id: "catch-1",
          timestamp: "2026-04-09T10:00:00Z",
          lat: 51.987654,
          lon: 4.123456,
          species: "Pike",
          technique: "Jerkbait",
          notes: "Canal edge",
        }}
      />,
    );

    expect(screen.getByTestId("selected-point")).toHaveTextContent(
      "51.987654,4.123456",
    );
  });

  it("shows current and pending points separately before confirmation in edit mode", async () => {
    const user = userEvent.setup();

    render(
      <CatchForm
        mode="edit"
        isSubmitting={false}
        onSubmit={vi.fn()}
        initialValues={{
          catch_id: "catch-1",
          timestamp: "2026-04-09T10:00:00Z",
          lat: 51.987654,
          lon: 4.123456,
          species: "Pike",
          technique: "Jerkbait",
          notes: "Canal edge",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Pick location on map" }));

    expect(screen.getByTestId("selected-point")).toHaveTextContent("51.987654,4.123456");
    expect(screen.getByTestId("pending-point")).toHaveTextContent("53.123456,6.654321");
    expect(screen.getByRole("button", { name: "Keep current location" })).toBeInTheDocument();
  });
});
