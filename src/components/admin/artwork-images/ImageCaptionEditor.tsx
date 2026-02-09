import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ArtworkImage } from "@/types";

interface ImageCaptionEditorProps {
  image: ArtworkImage;
  imageLabel: string;
  onCaptionChange: (imageId: string, caption: string | null) => void;
}

const ImageCaptionEditor = ({ image, imageLabel, onCaptionChange }: ImageCaptionEditorProps) => {
  const isDetail = image.caption === "(DETAIL)";
  const hasCustomCaption = !!image.caption && !isDetail;

  const [mode, setMode] = useState<"default" | "detail" | "custom">(
    isDetail ? "detail" : hasCustomCaption ? "custom" : "default"
  );
  const [customText, setCustomText] = useState(hasCustomCaption ? image.caption || "" : "");

  const handleModeChange = (newMode: "default" | "detail" | "custom") => {
    setMode(newMode);
    if (newMode === "default") {
      onCaptionChange(image.id, null);
    } else if (newMode === "detail") {
      onCaptionChange(image.id, "(DETAIL)");
    }
    // For "custom", wait until user types and blurs
  };

  const handleCustomBlur = () => {
    const trimmed = customText.trim();
    if (mode === "custom" && trimmed) {
      onCaptionChange(image.id, trimmed);
    } else if (mode === "custom" && !trimmed) {
      // Empty custom → revert to default
      setMode("default");
      onCaptionChange(image.id, null);
    }
  };

  return (
    <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {imageLabel} — Caption
      </Label>

      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          variant={mode === "default" ? "default" : "outline"}
          size="sm"
          className="text-xs h-7"
          onClick={() => handleModeChange("default")}
        >
          Usar datos de la obra
        </Button>
        <Button
          type="button"
          variant={mode === "detail" ? "default" : "outline"}
          size="sm"
          className="text-xs h-7"
          onClick={() => handleModeChange("detail")}
        >
          + (DETAIL)
        </Button>
        <Button
          type="button"
          variant={mode === "custom" ? "default" : "outline"}
          size="sm"
          className="text-xs h-7"
          onClick={() => handleModeChange("custom")}
        >
          Caption personalizado
        </Button>
      </div>

      {mode === "default" && (
        <p className="text-xs text-muted-foreground italic">
          Se mostrará: Título, Año / Materiales / Dimensiones
        </p>
      )}

      {mode === "detail" && (
        <p className="text-xs text-muted-foreground italic">
          Se mostrará: Título, Año (DETAIL) / Materiales / Dimensiones
        </p>
      )}

      {mode === "custom" && (
        <Input
          placeholder="Ej: Otra pintura, 2024 — Óleo sobre tela — 50 x 40 cm"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onBlur={handleCustomBlur}
          className="text-xs h-8"
          autoFocus
        />
      )}
    </div>
  );
};

export default ImageCaptionEditor;
