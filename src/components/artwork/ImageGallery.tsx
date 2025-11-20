import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  artworkTitle: string;
  onImageClick: () => void;
}

const ImageGallery = ({ images, artworkTitle, onImageClick }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Image */}
      <div 
        className="aspect-[4/5] bg-muted overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
        onClick={onImageClick}
      >
        <img
          src={images[selectedIndex]}
          alt={`${artworkTitle} - Image ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 justify-center flex-wrap">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`w-20 h-20 overflow-hidden transition-all ${
                selectedIndex === index
                  ? "ring-2 ring-foreground opacity-100"
                  : "ring-1 ring-border opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={image}
                alt={`${artworkTitle} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
