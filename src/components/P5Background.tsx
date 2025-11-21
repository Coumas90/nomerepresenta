import { useEffect, useRef } from "react";
import p5 from "p5";
import { useArtworks } from "@/hooks/useArtworks";

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

  useEffect(() => {
    if (!containerRef.current || isLoading || !artworks || artworks.length === 0) return;

    let images: p5.Image[] = [];
    let tiles: Tile[] = [];
    let mouseX = 0;
    let mouseY = 0;
    const COLS = 8;
    const ROWS = 6;
    const PARALLAX_STRENGTH = 0.02;

    const sketch = (p: p5) => {
      p.setup = () => {
        // Load all artwork images
        artworks.forEach((artwork) => {
          p.loadImage(artwork.image_url, (img) => {
            images.push(img);
          });
        });
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(containerRef.current!);
        p.pixelDensity(1); // Performance optimization
        p.frameRate(30); // Limit frame rate for better performance

        // Initialize tiles
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
      };

      p.draw = () => {
        p.background(20, 20, 30);

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

          // Randomly switch images occasionally
          if (p.frameCount % 300 === index % 300 && Math.random() > 0.7) {
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

        // Apply blur effect
        p.filter(p.BLUR, 2);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);

        // Recalculate tile positions
        const tileW = p.width / COLS;
        const tileH = p.height / ROWS;
        let index = 0;
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            if (tiles[index]) {
              tiles[index].x = col * tileW;
              tiles[index].y = row * tileH;
              tiles[index].w = tileW;
              tiles[index].h = tileH;
            }
            index++;
          }
        }
      };
    };

    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, [artworks, isLoading]);

  if (isLoading || !artworks || artworks.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10" />
    );
  }

  return <div ref={containerRef} className="fixed inset-0 -z-10" />;
};
