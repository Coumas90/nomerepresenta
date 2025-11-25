import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import { useArtworks } from "@/hooks/useArtworks";

// Device detection and performance settings
const getDeviceSettings = () => {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;

  if (isMobile) {
    return {
      cols: 3,
      rows: 3,
      parallaxStrength: 0.01, // Reduced parallax for mobile
      maxInitialImages: 4,
      pixelDensity: 1,
      baseFrameRate: 15,
      activeFrameRate: 20,
      blurAmount: 1, // Less blur for performance
      enableImageSwitching: false, // Disable on mobile
    };
  }

  if (isTablet) {
    return {
      cols: 4,
      rows: 3,
      parallaxStrength: 0.015,
      maxInitialImages: 5,
      pixelDensity: 1,
      baseFrameRate: 18,
      activeFrameRate: 25,
      blurAmount: 1.5,
      enableImageSwitching: true,
    };
  }

  // Desktop settings (adjust for low-end devices)
  return {
    cols: isLowEnd ? 5 : 6,
    rows: isLowEnd ? 3 : 4,
    parallaxStrength: 0.02,
    maxInitialImages: isLowEnd ? 5 : 6,
    pixelDensity: 1,
    baseFrameRate: isLowEnd ? 18 : 20,
    activeFrameRate: isLowEnd ? 25 : 30,
    blurAmount: 2,
    enableImageSwitching: true,
  };
};

interface Tile {
  x: number;
  y: number;
  w: number;
  h: number;
  img: p5.Image | null;
  imgIndex: number;
  offsetX: number;
  offsetY: number;
  targetOffsetX: number;
  targetOffsetY: number;
  opacity: number;
  targetOpacity: number;
}

export const P5Background = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: artworks, isLoading } = useArtworks();
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const isMouseMovingRef = useRef(false);
  const mouseMoveTimeoutRef = useRef<number>();
  const [loadError, setLoadError] = useState<string | null>(null);

  // Update ref when state changes
  useEffect(() => {
    isMouseMovingRef.current = isMouseMoving;
  }, [isMouseMoving]);

  // Helper to convert relative URLs to absolute
  const getAbsoluteUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${window.location.origin}${url}`;
  };

  useEffect(() => {
    if (!containerRef.current || isLoading || !artworks || artworks.length === 0) return;

    // Get device-specific settings
    const deviceSettings = getDeviceSettings();
    
    let images: p5.Image[] = [];
    let tiles: Tile[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let imagesLoaded = false;
    const COLS = deviceSettings.cols;
    const ROWS = deviceSettings.rows;
    const PARALLAX_STRENGTH = deviceSettings.parallaxStrength;
    const MAX_INITIAL_IMAGES = deviceSettings.maxInitialImages;
    let allImagesLoaded = false;

    const sketch = (p: p5) => {
      const initializeTiles = () => {
        if (images.length === 0) return;
        
        tiles = []; // Clear existing tiles
        const tileW = p.width / COLS;
        const tileH = p.height / ROWS;

        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            const imgIndex = Math.floor(Math.random() * images.length);
            tiles.push({
              x: col * tileW,
              y: row * tileH,
              w: tileW,
              h: tileH,
              img: images[imgIndex],
              imgIndex,
              offsetX: 0,
              offsetY: 0,
              targetOffsetX: 0,
              targetOffsetY: 0,
              opacity: 0.6 + Math.random() * 0.4,
              targetOpacity: 0.6 + Math.random() * 0.4,
            });
          }
        }
        imagesLoaded = true;
      };

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(containerRef.current!);
        p.pixelDensity(deviceSettings.pixelDensity);
        p.frameRate(deviceSettings.baseFrameRate);

        // Cargar solo las primeras 6 imágenes inicialmente
        const initialArtworks = artworks.slice(0, MAX_INITIAL_IMAGES);
        const remainingArtworks = artworks.slice(MAX_INITIAL_IMAGES);
        
        let loadedCount = 0;
        
        // Cargar imágenes iniciales
        initialArtworks.forEach((artwork) => {
          p.loadImage(
            getAbsoluteUrl(artwork.image_url),
            (img) => {
              images.push(img);
              loadedCount++;
              
              if (loadedCount === initialArtworks.length) {
                console.log(`✅ Initial ${loadedCount} images loaded`);
                initializeTiles();
              }
            },
            (err) => {
              console.error('Error loading image:', artwork.image_url, err);
              setLoadError(`Failed to load: ${artwork.image_url}`);
              loadedCount++;
              if (loadedCount === initialArtworks.length && images.length > 0) {
                initializeTiles();
              }
            }
          );
        });

        // Lazy load del resto después de 2 segundos
        if (remainingArtworks.length > 0) {
          setTimeout(() => {
            console.log(`🔄 Loading remaining ${remainingArtworks.length} images...`);
            remainingArtworks.forEach((artwork) => {
              p.loadImage(
                getAbsoluteUrl(artwork.image_url),
                (img) => {
                  images.push(img);
                  if (images.length === artworks.length) {
                    allImagesLoaded = true;
                    console.log(`✅ All ${artworks.length} images loaded`);
                  }
                },
                (err) => {
                  console.error('Error loading remaining image:', artwork.image_url, err);
                }
              );
            });
          }, 2000);
        } else {
          allImagesLoaded = true;
        }
      };

      p.draw = () => {
        p.background(20, 20, 30);

        if (!imagesLoaded || tiles.length === 0) {
          p.fill(255, 255, 255, 100);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(16);
          p.text('Loading artworks...', p.width / 2, p.height / 2);
          return;
        }

        // Aumentar frameRate solo cuando el mouse se mueve (usando ref)
        if (isMouseMovingRef.current) {
          p.frameRate(deviceSettings.activeFrameRate);
        } else {
          p.frameRate(deviceSettings.baseFrameRate);
        }

        // Update mouse position smoothly
        mouseX = p.lerp(mouseX, p.mouseX, 0.1);
        mouseY = p.lerp(mouseY, p.mouseY, 0.1);

        // Draw tiles
        tiles.forEach((tile, index) => {
          if (!tile.img) return;

          // Calculate parallax offset based on mouse position
          const centerX = p.width / 2;
          const centerY = p.height / 2;
          const distX = (mouseX - centerX) * PARALLAX_STRENGTH;
          const distY = (mouseY - centerY) * PARALLAX_STRENGTH;

          // Calculate tile-specific offset
          const tileDistX = (tile.x + tile.w / 2 - centerX) / centerX;
          const tileDistY = (tile.y + tile.h / 2 - centerY) / centerY;

          tile.targetOffsetX = distX * tileDistX;
          tile.targetOffsetY = distY * tileDistY;

          // Smooth interpolation
          tile.offsetX = p.lerp(tile.offsetX, tile.targetOffsetX, 0.05);
          tile.offsetY = p.lerp(tile.offsetY, tile.targetOffsetY, 0.05);
          tile.opacity = p.lerp(tile.opacity, tile.targetOpacity, 0.05);

          // Randomly change target opacity for subtle animation
          if (p.frameCount % 120 === index % 120) {
            tile.targetOpacity = 0.3 + Math.random() * 0.5;
          }

          // Randomly switch images occasionally (solo si todas las imágenes están cargadas y dispositivo lo soporta)
          if (deviceSettings.enableImageSwitching && allImagesLoaded && p.frameCount % 300 === index % 300 && Math.random() > 0.7) {
            const newIndex = Math.floor(Math.random() * images.length);
            tile.imgIndex = newIndex;
            tile.img = images[newIndex];
          }

          // Draw tile with image fragment
          p.push();
          p.translate(tile.x + tile.offsetX, tile.y + tile.offsetY);
          p.tint(255, tile.opacity * 255);

          // Sample random region from the artwork
          const imgW = tile.img.width;
          const imgH = tile.img.height;
          const sampleX = (p.frameCount * 0.1 + index * 50) % (imgW - tile.w);
          const sampleY = (p.frameCount * 0.05 + index * 30) % (imgH - tile.h);

          p.image(
            tile.img,
            0,
            0,
            tile.w,
            tile.h,
            sampleX,
            sampleY,
            tile.w,
            tile.h
          );

          p.pop();
        });

        // Apply dark overlay with gradient
        p.push();
        p.noStroke();
        const ctx = p.drawingContext as CanvasRenderingContext2D;
        if (ctx.createRadialGradient) {
          const gradient = ctx.createRadialGradient(
            p.width / 2,
            p.height / 2,
            0,
            p.width / 2,
            p.height / 2,
            p.width
          );
          gradient.addColorStop(0, "rgba(10, 10, 20, 0.5)");
          gradient.addColorStop(1, "rgba(10, 10, 20, 0.8)");
          ctx.fillStyle = gradient;
          p.rect(0, 0, p.width, p.height);
        } else {
          p.fill(10, 10, 20, 150);
          p.rect(0, 0, p.width, p.height);
        }
        p.pop();

        // Apply blur effect (device-optimized)
        if (deviceSettings.blurAmount > 0) {
          p.filter(p.BLUR, deviceSettings.blurAmount);
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);

        // Reinitialize tiles with new dimensions if images are loaded
        if (imagesLoaded && images.length > 0) {
          initializeTiles();
        }
      };
    };

    const p5Instance = new p5(sketch);

    // Debounce del mouse movement
    const handleMouseMove = () => {
      setIsMouseMoving(true);
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
      mouseMoveTimeoutRef.current = window.setTimeout(() => {
        setIsMouseMoving(false);
      }, 150);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      p5Instance.remove();
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, [artworks, isLoading]);

  if (isLoading || !artworks || artworks.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10" />
    );
  }

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 -z-10" />
      {loadError && (
        <div className="fixed bottom-4 right-4 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md text-sm max-w-md z-50">
          {loadError}
        </div>
      )}
    </>
  );
};
