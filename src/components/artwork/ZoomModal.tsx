import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  title: string;
}

export const ZoomModal = ({ isOpen, onClose, image, title }: ZoomModalProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(1, scale + delta), 3);
    setScale(newScale);
    
    // Si el zoom vuelve a 1, resetear posición
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full bg-black/95 border-none p-0 overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-background/20 hover:bg-background/40 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Instrucciones */}
        <div className="absolute top-4 left-4 z-50 bg-background/20 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-white text-sm font-medium">
            Rueda del mouse para zoom • Arrastra para mover
          </p>
        </div>

        {/* Indicador de zoom */}
        {scale > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-white text-sm font-medium">
              {Math.round(scale * 100)}%
            </p>
          </div>
        )}

        {/* Imagen */}
        <div className="flex items-center justify-center w-full h-full p-8">
          <img
            ref={imageRef}
            src={image}
            alt={title}
            className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
              isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'
            }`}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            }}
            draggable={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
