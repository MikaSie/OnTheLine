import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import type { Catch } from "../../../lib/types";
import { toMapPoint } from "../../maps/lib/map-utils";
import { catchFormSchema, type CatchFormValues } from "../lib/catch-form-schema";
import { LocationFieldGroup } from "./location-field-group";

interface CatchFormProps {
  mode: "create" | "edit";
  initialValues?: Catch;
  isSubmitting: boolean;
  onSubmit: (values: CatchFormValues) => void;
}

export function CatchForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: CatchFormProps) {
  const form = useForm<CatchFormValues>({
    resolver: zodResolver(catchFormSchema),
    defaultValues: {
      lat: initialValues?.lat,
      lon: initialValues?.lon,
      species: initialValues?.species ?? "",
      technique: initialValues?.technique ?? "",
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

  useEffect(() => {
    reset({
      lat: initialValues?.lat,
      lon: initialValues?.lon,
      species: initialValues?.species ?? "",
      technique: initialValues?.technique ?? "",
      notes: initialValues?.notes ?? "",
    });
  }, [initialValues, reset]);

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
                <Label htmlFor="species" className="text-base font-semibold">
                  Species
                </Label>
                <Input
                  id="species"
                  className="h-16 rounded-[1.4rem] px-7 text-[1.05rem] md:text-[1.15rem]"
                  placeholder="Sea trout"
                  {...register("species")}
                />
                {errors.species ? (
                  <p className="text-sm text-destructive">{errors.species.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="technique" className="text-base font-semibold">
                  Technique
                </Label>
                <Input
                  id="technique"
                  className="h-16 rounded-[1.4rem] px-7 text-[1.05rem] md:text-[1.15rem]"
                  placeholder="Spinning, jigging, fly..."
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
