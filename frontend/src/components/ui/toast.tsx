import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "../../lib/utils";

export const ToastProvider = ToastPrimitives.Provider;
export const ToastViewport = ToastPrimitives.Viewport;
export const Toast = ToastPrimitives.Root;
export const ToastTitle = ToastPrimitives.Title;
export const ToastDescription = ToastPrimitives.Description;

export function ToastClose(
  props: ComponentPropsWithoutRef<typeof ToastPrimitives.Close>,
) {
  return (
    <ToastPrimitives.Close
      className="rounded-full p-1 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
}

export function ToastViewportRoot() {
  return (
    <ToastViewport className="fixed right-4 top-4 z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-3 outline-none" />
  );
}

export function ToastRoot({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ToastPrimitives.Root>) {
  return (
    <Toast
      className={cn(
        "panel flex items-start justify-between gap-3 p-4 data-[state=open]:animate-fade-up",
        className,
      )}
      {...props}
    />
  );
}
