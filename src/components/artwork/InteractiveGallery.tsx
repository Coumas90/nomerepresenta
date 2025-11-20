import { useState, useRef } from "react";
import { ZoomModal } from "./ZoomModal";

interface InteractiveGalleryProps {
  image: string;
  imageDetail: string;
  title: string;
}

export const InteractiveGallery = ({ image, imageDetail, title }: InteractiveGalleryProps) => {
  const [showZoom, setShowZoom] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<'left' | 'center' | 'right' | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Divide la imagen en 3 zonas: izquierda (33%), centro (34%), derecha (33%)
    if (x < width * 0.33) {
      setCursorPosition('left');
    } else if (x > width * 0.67) {
      setCursorPosition('right');
    } else {
      setCursorPosition('center');
    }
  };

  const handleMouseLeave = () => {
    setCursorPosition(null);
  };

  const handleClick = () => {
    if (cursorPosition === 'center') {
      setShowZoom(true);
    }
  };

  return (
    <>
      <div 
        ref={imageRef}
        className="relative w-full max-w-xl group"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <img 
          src={image} 
          alt={title} 
          loading="lazy" 
          decoding="async" 
          className={`w-full h-auto object-contain transition-opacity duration-200 ${
            cursorPosition === 'center' ? 'cursor-zoom-in' : 'cursor-pointer'
          }`}
        />
      </div>

      <ZoomModal 
        isOpen={showZoom}
        onClose={() => setShowZoom(false)}
        image={imageDetail}
        title={title}
      />
    </>
  );
};
