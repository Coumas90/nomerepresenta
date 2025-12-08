import { cn } from "@/lib/utils";

interface ImageSkeletonProps {
  className?: string;
  variant?: "default" | "shimmer" | "pulse";
  aspectRatio?: "square" | "video" | "portrait" | "auto";
}

export const ImageSkeleton = ({ 
  className, 
  variant = "shimmer",
  aspectRatio = "auto"
}: ImageSkeletonProps) => {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: ""
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectClasses[aspectRatio],
        variant === "pulse" && "animate-pulse",
        variant === "shimmer" && "skeleton-shimmer",
        className
      )}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-muted-foreground/5 to-transparent" />
    </div>
  );
};
