import { z } from "zod";

const coordinateField = (label: string, min: number, max: number) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
      }

      if (typeof value === "string") {
        const normalized = value.trim().replace(",", ".");
        if (!normalized) {
          return undefined;
        }

        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : undefined;
      }

      return undefined;
    },
    z
      .number({
        required_error: `${label} is required`,
        invalid_type_error: `${label} is required`,
      })
      .min(min, `Minimum is ${min}`)
      .max(max, `Maximum is ${max}`),
  );

export const catchFormSchema = z.object({
  lat: coordinateField("Latitude", -90, 90),
  lon: coordinateField("Longitude", -180, 180),
  species: z
    .string()
    .trim()
    .min(1, "Species is required")
    .max(100, "Keep species under 100 characters"),
  methodCategory: z
    .string()
    .trim()
    .min(1, "Method category is required")
    .max(100, "Keep method category under 100 characters"),
  technique: z
    .string()
    .max(100, "Keep technique under 100 characters")
    .optional(),
  notes: z.string().max(500, "Keep notes under 500 characters").optional(),
});

export type CatchFormValues = z.infer<typeof catchFormSchema>;
