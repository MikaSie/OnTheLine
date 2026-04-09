import type { UseFormRegister, FieldErrors } from "react-hook-form";

import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { CatchFormValues } from "../lib/catch-form-schema";

interface LocationFieldGroupProps {
  register: UseFormRegister<CatchFormValues>;
  errors: FieldErrors<CatchFormValues>;
}

export function LocationFieldGroup({
  register,
  errors,
}: LocationFieldGroupProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="lat">Latitude</Label>
        <Input
          id="lat"
          type="text"
          inputMode="decimal"
          placeholder="52.3676"
          {...register("lat")}
        />
        <p className="text-xs text-muted-foreground">
          Use values between -90 and 90.
        </p>
        {errors.lat ? (
          <p className="text-sm text-destructive">{errors.lat.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lon">Longitude</Label>
        <Input
          id="lon"
          type="text"
          inputMode="decimal"
          placeholder="4.9041"
          {...register("lon")}
        />
        <p className="text-xs text-muted-foreground">
          Use values between -180 and 180.
        </p>
        {errors.lon ? (
          <p className="text-sm text-destructive">{errors.lon.message}</p>
        ) : null}
      </div>
    </div>
  );
}
