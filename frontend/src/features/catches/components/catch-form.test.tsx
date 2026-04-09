import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CatchForm } from "./catch-form";

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
});
