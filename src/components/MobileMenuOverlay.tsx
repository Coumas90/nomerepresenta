import { X } from "lucide-react";

interface MobileMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

const MobileMenuOverlay = ({ isOpen, onClose, onNavigate }: MobileMenuOverlayProps) => {
  if (!isOpen) return null;

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]">
      {/* Close button - minimal, thin, top-right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-[#F2F2F2] hover:opacity-70 transition-opacity"
        aria-label="Close menu"
      >
        <X className="h-5 w-5 stroke-[1.5]" />
      </button>

      {/* Centered content block - 70% width */}
      <div className="h-full flex items-center justify-center">
        <div className="w-[70%] text-left">
          {/* Artist name - same size as homepage header */}
          <button
            onClick={() => handleNavigate('top')}
            className="text-[#F2F2F2] hover:opacity-70 transition-opacity mb-16"
          >
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              IVAN COMAS
            </h1>
          </button>

          {/* Menu items with generous vertical spacing */}
          <nav className="space-y-8">
            <button
              onClick={() => handleNavigate('works')}
              className="block text-xl font-medium tracking-wide text-[#F2F2F2] hover:opacity-70 transition-opacity"
            >
              WORKS
            </button>
            <button
              onClick={() => handleNavigate('works')}
              className="block text-lg tracking-wide text-[#F2F2F2] pl-1 hover:opacity-70 transition-opacity"
            >
              / TRI-PEEL
            </button>
            <button
              onClick={() => handleNavigate('bio')}
              className="block text-xl font-medium tracking-wide text-[#F2F2F2] hover:opacity-70 transition-opacity mt-12"
            >
              BIO
            </button>
            <button
              onClick={() => handleNavigate('contact')}
              className="block text-xl font-medium tracking-wide text-[#F2F2F2] hover:opacity-70 transition-opacity"
            >
              CONTACT
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuOverlay;
