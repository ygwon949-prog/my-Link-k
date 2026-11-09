import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[8px] border-[2px] border-black bg-white px-3 py-2 text-sm font-bold text-black shadow-[2px_2px_0px_#000000] transition-all file:border-0 file:bg-transparent file:text-sm file:font-black placeholder:text-black/40 placeholder:font-medium focus-visible:outline-none focus-visible:shadow-[3px_3px_0px_#000000] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
