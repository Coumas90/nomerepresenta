import { cn } from "@/lib/utils";

interface SerieDividerProps {
  seriesName?: string;
  showName?: boolean;
  className?: string;
}

export const SerieDivider = ({ 
  seriesName, 
  showName = false,
  className 
}: SerieDividerProps) => {
  return (
    <div className={cn("w-full py-8 md:py-12", className)}>
      <div className="max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] mx-auto">
        {/* Black horizontal line */}
        <div className="w-full h-px bg-stone-900" />
        
        {/* Optional series name label */}
        {showName && seriesName && (
          <p className="mt-4 text-stone-500 text-xs uppercase tracking-widest">
            {seriesName}
          </p>
        )}
      </div>
    </div>
  );
};

export default SerieDivider;
