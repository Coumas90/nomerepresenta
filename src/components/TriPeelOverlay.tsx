import { X } from "lucide-react";

interface TriPeelOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  metadata?: string;
}

const TriPeelOverlay = ({ 
  isOpen, 
  onClose, 
  title = "TRI-PEEL",
  description = "TRI-PEEL explores the intersection of organic forms and geometric structures, revealing the hidden patterns that emerge when natural processes meet intentional design. Each piece in this series investigates the tension between chaos and order, inviting viewers to discover their own interpretations within the layered compositions.",
  metadata = "Mixed media on canvas • 2023-2024"
}: TriPeelOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-50 flex flex-col animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Overlay Header */}
      <header className="flex items-center justify-between p-6 md:p-8">
        <span className="text-stone-900 text-sm md:text-base font-medium tracking-widest uppercase">
          {title}
        </span>
        <button
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center
                     text-stone-900 hover:opacity-70 transition-opacity duration-200 focus:outline-none
                     -mr-2 md:-mr-3"
          aria-label="Close overlay"
        >
          <X className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
        </button>
      </header>

      {/* Overlay Content */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-16 lg:px-32">
        <div className="max-w-2xl text-center">
          <h2 className="text-stone-900 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default TriPeelOverlay;
