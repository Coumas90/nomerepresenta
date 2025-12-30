import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { compressImageWithDetails, formatFileSize } from "@/lib/imageCompression";
import { getCompressionOptions } from "@/hooks/useCompressionSettings";
import type { CompressionResult } from "@/types";
import { Upload, ImageIcon, ArrowRight, X, ZoomIn, ZoomOut, Move } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";

interface PreviewState {
  originalUrl: string;
  originalSize: number;
  compressedUrl: string;
  result: CompressionResult;
}

export const CompressionPreview = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setIsProcessing(true);
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    try {
      const originalUrl = URL.createObjectURL(file);
      const compressionOptions = getCompressionOptions();
      const result = await compressImageWithDetails(file, compressionOptions);
      const compressedUrl = URL.createObjectURL(result.file);

      setPreview({
        originalUrl,
        originalSize: file.size,
        compressedUrl,
        result,
      });
    } catch (error) {
      console.error('Compression preview failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview.originalUrl);
      URL.revokeObjectURL(preview.compressedUrl);
    }
    setPreview(null);
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatBadgeClass = (format: string) => {
    switch (format) {
      case 'avif': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'webp': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isZoomed) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  }, [isZoomed, panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !isZoomed) return;
    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;
    // Limit panning to reasonable bounds
    const maxPan = 500;
    setPanPosition({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY)),
    });
  }, [isPanning, isZoomed, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const toggleZoom = () => {
    if (isZoomed) {
      setPanPosition({ x: 0, y: 0 });
    }
    setIsZoomed(!isZoomed);
  };

  const imageStyle = isZoomed ? {
    transform: `scale(2) translate(${panPosition.x / 2}px, ${panPosition.y / 2}px)`,
    cursor: isPanning ? 'grabbing' : 'grab',
  } : {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Compression Preview
        </CardTitle>
        <CardDescription>
          Test compression on a single image to preview quality and savings before batch processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!preview ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className={`h-10 w-10 mx-auto mb-3 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-sm text-muted-foreground">
              {isProcessing ? 'Processing...' : 'Drop an image here or click to select'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Toggle
                  pressed={isZoomed}
                  onPressedChange={toggleZoom}
                  aria-label="Toggle zoom"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {isZoomed ? <ZoomOut className="h-4 w-4 mr-1" /> : <ZoomIn className="h-4 w-4 mr-1" />}
                  {isZoomed ? '100% Zoom' : 'Zoom In'}
                </Toggle>
                {isZoomed && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Move className="h-3 w-3" /> Drag to pan
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearPreview}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <div 
              ref={containerRef}
              className="grid md:grid-cols-2 gap-4"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Original */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Original</span>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(preview.originalSize)}
                  </span>
                </div>
                <div 
                  className="aspect-square bg-muted rounded-lg overflow-hidden"
                  onMouseDown={handleMouseDown}
                >
                  <img
                    src={preview.originalUrl}
                    alt="Original"
                    className="w-full h-full object-contain transition-transform duration-150 select-none"
                    style={imageStyle}
                    draggable={false}
                  />
                </div>
              </div>

              {/* Compressed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Compressed</span>
                    <Badge variant="outline" className={formatBadgeClass(preview.result.format)}>
                      {preview.result.format.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(preview.result.compressedSize)}
                  </span>
                </div>
                <div 
                  className="aspect-square bg-muted rounded-lg overflow-hidden"
                  onMouseDown={handleMouseDown}
                >
                  <img
                    src={preview.compressedUrl}
                    alt="Compressed"
                    className="w-full h-full object-contain transition-transform duration-150 select-none"
                    style={imageStyle}
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold">{formatFileSize(preview.originalSize)}</p>
                <p className="text-xs text-muted-foreground">Original</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center">
                <p className="text-2xl font-bold">{formatFileSize(preview.result.compressedSize)}</p>
                <p className="text-xs text-muted-foreground">Compressed</p>
              </div>
              <div className="text-center pl-4 border-l">
                <p className={`text-2xl font-bold ${preview.result.savingsPercent > 0 ? 'text-green-600' : ''}`}>
                  {preview.result.savingsPercent.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Savings</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Try Another Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
