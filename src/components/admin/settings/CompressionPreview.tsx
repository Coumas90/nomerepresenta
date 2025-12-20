import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { compressImageWithDetails, formatFileSize, CompressionResult } from "@/lib/imageCompression";
import { getCompressionOptions } from "@/hooks/useCompressionSettings";
import { Upload, ImageIcon, ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    setIsProcessing(true);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatBadgeClass = (format: string) => {
    switch (format) {
      case 'avif': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'webp': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearPreview}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Original</span>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(preview.originalSize)}
                  </span>
                </div>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={preview.originalUrl}
                    alt="Original"
                    className="w-full h-full object-contain"
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
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={preview.compressedUrl}
                    alt="Compressed"
                    className="w-full h-full object-contain"
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
