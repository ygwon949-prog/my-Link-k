"use client";

import * as React from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cn } from "@/lib/utils";

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      className={cn(
        "text-xs sm:text-sm font-black leading-none text-black select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
        className
      )}
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn("text-[11px] font-bold text-black/60", className)}
      {...props}
    />
  );
}

function FieldError({
  className,
  match = true,
  ...props
}: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      data-slot="field-error"
      match={match}
      className={cn(
        "flex items-center gap-1 text-xs font-black text-red-600",
        className
      )}
      {...props}
    />
  );
}

export { Field, FieldLabel, FieldDescription, FieldError };
