import { Plus, Minus } from "lucide-react";

interface ZoomControlsProps {
  isZoomed: boolean;
  onToggle: () => void;
}

export const ZoomControls = ({ isZoomed, onToggle }: ZoomControlsProps) => {
  return (
    <button
      onClick={onToggle}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-10 group-hover:opacity-100"
      aria-label={isZoomed ? "Zoom out" : "Zoom in"}
    >
      {isZoomed ? (
        <Minus size={24} className="text-foreground" />
      ) : (
        <Plus size={24} className="text-foreground" />
      )}
    </button>
  );
};
