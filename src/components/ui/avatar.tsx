import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 select-none overflow-hidden rounded-full border-[3px] border-black bg-white shadow-[4px_4px_0px_#000000]",
  {
    variants: {
      size: {
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

interface AvatarContextValue {
  hasError: boolean;
  setHasError: (value: boolean) => void;
  hasImage: boolean;
  setHasImage: (value: boolean) => void;
}

const AvatarContext = React.createContext<AvatarContextValue>({
  hasError: false,
  setHasError: () => {},
  hasImage: false,
  setHasImage: () => {},
});

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
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
  const [hasError, setHasError] = React.useState(false);
  const [hasImage, setHasImage] = React.useState(false);

  return (
    <AvatarContext.Provider
      value={{ hasError, setHasError, hasImage, setHasImage }}
    >
      <div className="relative inline-block mx-auto">
        <div
          data-slot="avatar"
          className={cn(avatarVariants({ size }), className)}
          {...props}
        >
          {children}
        </div>
        {isOnline && (
          <span
            data-slot="avatar-badge"
            className="absolute bottom-1 right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-[#4ADE80] border-[2px] sm:border-[2.5px] border-black shadow-[1.5px_1.5px_0px_#000000]"
            title="온라인 활동 중"
            aria-label="온라인 활동 중"
          />
        )}
      </div>
    </AvatarContext.Provider>
  );
}

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}

function AvatarImage({
  src,
  alt = "Avatar",
  className,
  priority = true,
}: AvatarImageProps) {
  const { hasError, setHasError, setHasImage } = React.useContext(AvatarContext);

  React.useEffect(() => {
    if (src) {
      setHasImage(true);
    }
  }, [src, setHasImage]);

  if (!src || hasError) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 640px) 100px, 128px"
      onError={() => setHasError(true)}
      className={cn("aspect-square h-full w-full object-cover", className)}
    />
  );
}

function AvatarFallback({
  className,
  children = "👤",
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { hasError, hasImage } = React.useContext(AvatarContext);

  // 이미지가 정상 로드 중일 때는 fallback을 숨김
  if (hasImage && !hasError) {
    return null;
  }

  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-white text-3xl sm:text-4xl font-black text-black select-none",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
