import { Skeleton } from "@/components/ui/skeleton";

export const AdminHeaderSkeleton = () => {
  return (
    <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Skeleton className="h-8 w-8" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
    </header>
  );
};
