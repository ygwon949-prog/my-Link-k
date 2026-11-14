"use client";

import * as React from "react";
import { Fieldset as FieldsetPrimitive } from "@base-ui/react/fieldset";
import { cn } from "@/lib/utils";

function Fieldset({ className, ...props }: FieldsetPrimitive.Root.Props) {
  return (
    <FieldsetPrimitive.Root
      data-slot="fieldset"
      className={cn(
        "flex flex-col gap-3.5 border-none p-0 m-0 min-w-0 transition-opacity data-[disabled]:opacity-60 data-[disabled]:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

function FieldsetLegend({
  className,
  ...props
}: FieldsetPrimitive.Legend.Props) {
  return (
    <FieldsetPrimitive.Legend
      data-slot="fieldset-legend"
      className={cn("text-sm font-black text-black", className)}
      {...props}
    />
  );
}

export { Fieldset, FieldsetLegend };
