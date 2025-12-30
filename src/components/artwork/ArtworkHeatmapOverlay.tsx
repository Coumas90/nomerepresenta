import { useEffect, useRef } from 'react';
import type { HeatmapPoint } from '@/types';

interface ArtworkHeatmapOverlayProps {
  points: HeatmapPoint[];
  width: number;
  height: number;
  opacity?: number;
}

const ArtworkHeatmapOverlay = ({ points, width, height, opacity = 0.6 }: ArtworkHeatmapOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw heatmap
    points.forEach(point => {
      const x = (point.x / 100) * width;
      const y = (point.y / 100) * height;
      const radius = 40 * point.value; // Radius based on intensity

      // Create radial gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      // Color from transparent to red with intensity
      const alpha = point.value * 0.5;
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    });
  }, [points, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0"
      style={{ opacity, pointerEvents: 'none' }}
    />
  );
};

export default ArtworkHeatmapOverlay;
