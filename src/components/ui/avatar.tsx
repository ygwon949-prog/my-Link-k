"use client";

import * as React from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[4px_4px_0px_#000000]",
  {
    variants: {
      size: {
        xs: "h-8 w-8 border-[2px] shadow-[1.5px_1.5px_0px_#000000]",
        sm: "h-16 w-16",
        md: "h-24 w-24 sm:h-28 sm:w-28",
        lg: "h-28 w-28 sm:h-32 sm:w-32",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends AvatarPrimitive.Root.Props,
    VariantProps<typeof avatarVariants> {
  isOnline?: boolean;
}

function Avatar({
  className,
  size,
  isOnline = false,
  children,
  ...props
}: AvatarProps) {
  return (
    <div className="relative inline-block mx-auto shrink-0">
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {children}
      </AvatarPrimitive.Root>
      {isOnline && (
        <span
          data-slot="avatar-badge"
          className="absolute bottom-1 right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-[#4ADE80] border-[2px] sm:border-[2.5px] border-black shadow-[1.5px_1.5px_0px_#000000]"
          title="온라인 활동 중"
          aria-label="온라인 활동 중"
        />
      )}
    </div>
  );
}

function AvatarImage({
  className,
  alt = "Avatar",
  ...props
}: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      alt={alt}
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  children = "👤",
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-white text-3xl sm:text-4xl font-black text-black select-none",
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
