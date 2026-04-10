import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import type { Catch } from "../../../lib/types";
import { toMapPoint } from "../../maps/lib/map-utils";
import { catchFormSchema, type CatchFormValues } from "../lib/catch-form-schema";
import { LocationFieldGroup } from "./location-field-group";

const EMPTY_METHOD_CATEGORY = "__none__";

function toDateTimeLocalValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMinutes = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offsetMinutes * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function getDefaultCaughtAt(mode: "create" | "edit", initialValue?: string) {
  if (initialValue) {
    return toDateTimeLocalValue(initialValue);
  }

  if (mode === "create") {
    return toDateTimeLocalValue(new Date().toISOString());
  }

  return "";
}

interface CatchFormProps {
  mode: "create" | "edit";
  initialValues?: Catch;
  isSubmitting: boolean;
  speciesOptions: string[];
  methodCategoryOptions: string[];
  onSubmit: (values: CatchFormValues) => void;
}

export function CatchForm({
  mode,
  initialValues,
  isSubmitting,
  speciesOptions,
  methodCategoryOptions,
  onSubmit,
}: CatchFormProps) {
  const form = useForm<CatchFormValues>({
    resolver: zodResolver(catchFormSchema),
    defaultValues: {
      lat: initialValues?.lat,
      lon: initialValues?.lon,
      caughtAt: getDefaultCaughtAt(mode, initialValues?.caught_at),
      species: initialValues?.species ?? "",
      lengthCm: initialValues?.length_cm ?? undefined,
      methodCategory: initialValues?.method_category ?? "",
      depthM: initialValues?.depth_m ?? undefined,
      technique: initialValues?.technique_detail ?? "",
      notes: initialValues?.notes ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedPoint = toMapPoint(watch("lat"), watch("lon"));
  const selectedSpecies = watch("species");
  const selectedMethodCategory = watch("methodCategory");
  const methodCategoryValue =
    selectedMethodCategory && selectedMethodCategory.trim().length > 0
      ? selectedMethodCategory
      : EMPTY_METHOD_CATEGORY;

  useEffect(() => {
    reset({
      lat: initialValues?.lat,
      lon: initialValues?.lon,
      caughtAt: getDefaultCaughtAt(mode, initialValues?.caught_at),
      species: initialValues?.species ?? "",
      lengthCm: initialValues?.length_cm ?? undefined,
      methodCategory: initialValues?.method_category ?? "",
      depthM: initialValues?.depth_m ?? undefined,
      technique: initialValues?.technique_detail ?? "",
      notes: initialValues?.notes ?? "",
    });
  }, [initialValues, mode, reset]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 md:p-6">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <LocationFieldGroup
            errors={errors}
            register={register}
            selectedPoint={selectedPoint}
            setValue={setValue}
          />

          <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-black/10 p-5 md:p-6">
            <div className="space-y-1">
              <p className="text-kicker">Catch details</p>
              <h3 className="font-display text-xl font-semibold">Species, method, and notes</h3>
              <p className="text-sm text-muted-foreground">
                Keep the written part of the record as clear as the mapped location.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caughtAt" className="text-base font-semibold">
                  Caught at
                </Label>
                <Input
                  id="caughtAt"
                  type="datetime-local"
                  className="h-16 rounded-[1.4rem] px-7 text-[1.05rem] md:text-[1.15rem]"
                  {...register("caughtAt")}
                />
                {errors.caughtAt ? (
                  <p className="text-sm text-destructive">{errors.caughtAt.message}</p>
                ) : mode === "create" ? (
                  <p className="text-sm text-muted-foreground">
                    Defaults to the current local time when you open the logger.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Species</Label>
                <Select
                  value={selectedSpecies}
                  onValueChange={(value) =>
                    setValue("species", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    aria-label="Species"
                    className="h-16 rounded-[1.4rem] px-7 text-[1.05rem] md:text-[1.15rem]"
                  >
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.species ? (
                  <p className="text-sm text-destructive">{errors.species.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lengthCm" className="text-base font-semibold">
                  Length (cm)
                </Label>
                <Input
                  id="lengthCm"
                  inputMode="decimal"
                  className="h-16 rounded-[1.4rem] px-7 text-[1.05rem] md:text-[1.15rem]"
                  placeholder="Optional"
                  {...register("lengthCm")}
                />
                {errors.lengthCm ? (
                  <p className="text-sm text-destructive">{errors.lengthCm.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Method Category</Label>
                <Select
                  value={methodCategoryValue}
                  onValueChange={(value) =>
                    setValue("methodCategory", value === EMPTY_METHOD_CATEGORY ? "" : value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    aria-label="Method Category"
                    className="h-16 rounded-[1.4rem] px-7 text-[1.05rem] md:text-[1.15rem]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EMPTY_METHOD_CATEGORY}>Optional</SelectItem>
                    {methodCategoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="depthM" className="text-base font-semibold">
                  Depth (m)
                </Label>
                <Input
                  id="depthM"
                  inputMode="decimal"
                  className="h-16 rounded-[1.4rem] px-7 text-[1.05rem] md:text-[1.15rem]"
                  placeholder="Optional"
                  {...register("depthM")}
                />
                {errors.depthM ? (
                  <p className="text-sm text-destructive">{errors.depthM.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="technique" className="text-base font-semibold">
                  Technique
                </Label>
                <Input
                  id="technique"
                  className="h-16 rounded-[1.4rem] px-7 text-[1.05rem] md:text-[1.15rem]"
                  placeholder="Optional, i.e. drop shot or jig"
                  {...register("technique")}
                />
                {errors.technique ? (
                  <p className="text-sm text-destructive">
                    {errors.technique.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">
                Notes
              </Label>
              <Textarea
                id="notes"
                className="min-h-[210px] rounded-[1.6rem] px-7 py-6 text-[1.05rem] leading-8 md:text-[1.12rem]"
                placeholder="Water clarity, wind, structure, retrieve pattern, time of day..."
                {...register("notes")}
              />
              {errors.notes ? (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Log catch"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
