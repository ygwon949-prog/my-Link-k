"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black border-[2px] border-black shadow-[2px_2px_0px_#000000] transition-all select-none",
  {
    variants: {
      variant: {
        default: "rounded-full bg-white text-black",
        primary: "rounded-full bg-primary text-black",
        secondary: "rounded-full bg-secondary text-black",
        accent: "rounded-full bg-accent text-black",
        destructive: "rounded-full bg-destructive text-black",
        tag: "rounded-[8px] bg-white text-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000000] cursor-default",
        sticker:
          "rounded-full bg-accent text-black rotate-6 shadow-[2px_2px_0px_#000000]",
      },
      size: {
        default: "text-xs px-2.5 py-1",
        sm: "text-[10px] px-2 py-0.5 rounded-[6px]",
        lg: "text-sm px-3.5 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type BadgeProps = useRender.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    state: {
      slot: "badge",
      variant,
      size,
    },
  });
}

export { Badge, badgeVariants };
