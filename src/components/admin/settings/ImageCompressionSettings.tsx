import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useCompressionSettings } from "@/hooks/useCompressionSettings";
import { supportsAVIF, supportsWebP } from "@/lib/imageCompression";
import { RotateCcw, Image, Maximize2, Sparkles, Target } from "lucide-react";
import { BatchRecompression } from "./BatchRecompression";
import { CompressionPreview } from "./CompressionPreview";

export const ImageCompressionSettings = () => {
  const { settings, updateSetting, resetToDefaults, DEFAULT_SETTINGS } = useCompressionSettings();
  
  const webpSupported = supportsWebP();
  const avifSupported = supportsAVIF();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Image Compression Settings</h2>
          <p className="text-muted-foreground">
            Configure how uploaded images are compressed and optimized
          </p>
        </div>
        <Button variant="outline" onClick={resetToDefaults} size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Max File Size
            </CardTitle>
            <CardDescription>
              Maximum file size after compression (in MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Size Limit</Label>
              <span className="text-sm font-medium">{settings.maxSizeMB} MB</span>
            </div>
            <Slider
              value={[settings.maxSizeMB]}
              onValueChange={([value]) => updateSetting('maxSizeMB', value)}
              min={0.5}
              max={10}
              step={0.5}
            />
            <p className="text-xs text-muted-foreground">
              Default: {DEFAULT_SETTINGS.maxSizeMB} MB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5" />
              Max Dimensions
            </CardTitle>
            <CardDescription>
              Maximum width or height in pixels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Max Width/Height</Label>
              <span className="text-sm font-medium">{settings.maxWidthOrHeight} px</span>
            </div>
            <Slider
              value={[settings.maxWidthOrHeight]}
              onValueChange={([value]) => updateSetting('maxWidthOrHeight', value)}
              min={800}
              max={4800}
              step={100}
            />
            <p className="text-xs text-muted-foreground">
              Default: {DEFAULT_SETTINGS.maxWidthOrHeight} px
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quality
            </CardTitle>
            <CardDescription>
              Compression quality (higher = better quality, larger file)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Quality Level</Label>
              <span className="text-sm font-medium">{Math.round(settings.initialQuality * 100)}%</span>
            </div>
            <Slider
              value={[settings.initialQuality * 100]}
              onValueChange={([value]) => updateSetting('initialQuality', value / 100)}
              min={50}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Default: {Math.round(DEFAULT_SETTINGS.initialQuality * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Minimum Savings
            </CardTitle>
            <CardDescription>
              Minimum compression savings to use WebP (otherwise tries AVIF)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Savings Threshold</Label>
              <span className="text-sm font-medium">{settings.minSavingsPercent}%</span>
            </div>
            <Slider
              value={[settings.minSavingsPercent]}
              onValueChange={([value]) => updateSetting('minSavingsPercent', value)}
              min={0}
              max={50}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Default: {DEFAULT_SETTINGS.minSavingsPercent}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Format Support</CardTitle>
          <CardDescription>
            Browser support for modern image formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${webpSupported ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
              <div className={`w-2 h-2 rounded-full ${webpSupported ? 'bg-green-500' : 'bg-destructive'}`} />
              WebP {webpSupported ? 'Supported' : 'Not Supported'}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${avifSupported ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
              <div className={`w-2 h-2 rounded-full ${avifSupported ? 'bg-green-500' : 'bg-amber-500'}`} />
              AVIF {avifSupported ? 'Supported' : 'Not Supported'}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Images are first compressed to WebP. If savings are below the threshold, AVIF is tried as a fallback (if supported).
          </p>
        </CardContent>
      </Card>

      <CompressionPreview />

      <BatchRecompression />
    </div>
  );
};
