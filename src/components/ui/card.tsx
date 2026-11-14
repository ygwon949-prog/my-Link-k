"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "relative rounded-[12px] border-[3px] border-black text-black shadow-[6px_6px_0px_#000000] transition-all",
  {
    variants: {
      variant: {
        default: "bg-card", // 시그니처 옐로우 (#FEF08A)
        white: "bg-white",
        secondary: "bg-secondary", // 스카이블루 (#BAE6FD)
        accent: "bg-accent", // 민트그린 (#A7F3D0)
        cream: "bg-[#FFFBEB]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type CardProps = useRender.ComponentProps<"div"> &
  VariantProps<typeof cardVariants>;

function Card({
  className,
  variant = "default",
  render,
  ...props
}: CardProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn(cardVariants({ variant }), className),
      },
      props
    ),
    state: {
      slot: "card",
      variant,
    },
  });
}

function CardHeader({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col space-y-1.5 p-6", className),
      },
      props
    ),
    state: {
      slot: "card-header",
    },
  });
}

function CardTitle({
  className,
  render,
  ...props
}: useRender.ComponentProps<"h3">) {
  return useRender({
    defaultTagName: "h3",
    render,
    props: mergeProps<"h3">(
      {
        className: cn(
          "font-black text-2xl tracking-tight leading-none text-black",
          className
        ),
      },
      props
    ),
    state: {
      slot: "card-title",
    },
  });
}

function CardDescription({
  className,
  render,
  ...props
}: useRender.ComponentProps<"p">) {
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(
      {
        className: cn("text-sm font-semibold text-black/80", className),
      },
      props
    ),
    state: {
      slot: "card-description",
    },
  });
}

function CardContent({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("p-6 pt-0", className),
      },
      props
    ),
    state: {
      slot: "card-content",
    },
  });
}

function CardFooter({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex items-center p-6 pt-0", className),
      },
      props
    ),
    state: {
      slot: "card-footer",
    },
  });
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
