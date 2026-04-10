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
  {
    catch_id: "3",
    caught_at: "2026-04-07T10:00:00Z",
    lat: 52.02,
    lon: 4.03,
    species: "Cod",
    technique_detail: "Spinning",
    notes: "Jetty",
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

    await user.click(screen.getByLabelText("Technique filter"));
    await user.click(screen.getByRole("option", { name: "Fly" }));

    expect(screen.getByText("Sea Bass")).toBeInTheDocument();
    expect(screen.queryByText("Sea Trout")).not.toBeInTheDocument();
  });

  it("filters catches by area and reports the visible count", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatchLogPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText("Area filter"));
    await user.click(screen.getByRole("option", { name: /52.0000° N \/ 4.0000° E area/i }));

    expect(screen.getByText("2 of 3 catches in view")).toBeInTheDocument();
    expect(screen.getByText("Sea Trout")).toBeInTheDocument();
    expect(screen.getByText("Cod")).toBeInTheDocument();
    expect(screen.queryByText("Sea Bass")).not.toBeInTheDocument();
  });

  it("sorts catches alphabetically by species", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatchLogPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByLabelText("Sort catches"));
    await user.click(screen.getByRole("option", { name: "Species A-Z" }));

    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual(["Cod", "Sea Bass", "Sea Trout"]);
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

  it("offers a recovery action when filters remove every catch", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CatchLogPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Search species or notes"), "salmon");

    expect(screen.getByText("No catches match these filters")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Sea Trout")).toBeInTheDocument();
  });
});
