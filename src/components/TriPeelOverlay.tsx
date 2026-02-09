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
      className="fixed inset-0 z-50 bg-stone-50"
    >
    </div>
  );
};

export default TriPeelOverlay;
