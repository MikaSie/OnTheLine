import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatchLogPage } from "./catch-log-page";

const mockUseCatches = vi.fn();

vi.mock("../hooks/use-catches", () => ({
  useCatches: () => mockUseCatches(),
}));

const catches = [
  {
    catch_id: "1",
    timestamp: "2026-04-09T10:00:00Z",
    lat: 52.0,
    lon: 4.0,
    species: "Sea Trout",
    technique: "Spinning",
    notes: "Rocks",
  },
  {
    catch_id: "2",
    timestamp: "2026-04-08T10:00:00Z",
    lat: 52.1,
    lon: 4.1,
    species: "Sea Bass",
    technique: "Fly",
    notes: "Harbor",
  },
];

describe("CatchLogPage", () => {
  beforeEach(() => {
    mockUseCatches.mockReset();
    mockUseCatches.mockReturnValue({
      isLoading: false,
      isError: false,
      data: catches,
    });
  });

  it("filters catches by search text", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatchLogPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sea Trout")).toBeInTheDocument();
    expect(screen.getByText("Sea Bass")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search species or notes"), "trout");

    expect(screen.getByText("Sea Trout")).toBeInTheDocument();
    expect(screen.queryByText("Sea Bass")).not.toBeInTheDocument();
  });

  it("filters catches by technique", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatchLogPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Fly" }));

    expect(screen.getByText("Sea Bass")).toBeInTheDocument();
    expect(screen.queryByText("Sea Trout")).not.toBeInTheDocument();
  });

  it("shows the offline state when the query errors", () => {
    mockUseCatches.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
    });

    render(
      <MemoryRouter>
        <CatchLogPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Catch log is offline")).toBeInTheDocument();
  });

  it("shows the empty state when no catches exist", () => {
    mockUseCatches.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    render(
      <MemoryRouter>
        <CatchLogPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Start building your analytical logbook")).toBeInTheDocument();
  });
});
