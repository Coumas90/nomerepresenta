import { useState, useCallback, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, X, Pencil, Check, GripVertical } from "lucide-react";
import { SortableThumb } from "./SortableThumb";
import { useUploadStudioImage, useCreateStudioImage, useUpdateStudioImage } from "@/hooks/useStudioImageMutations";
import { useUpdateStudioSeries } from "@/hooks/useStudioSeriesMutations";
import { useStudioSeries } from "@/hooks/useStudioSeries";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import type { StudioImage } from "@/types";

interface SeriesStudioSectionProps {
  seriesId: string;
  seriesName: string;
  isVisible?: boolean;
  images: StudioImage[];
  onDeleteSeries?: () => void;
  onPreviewImage: (image: StudioImage) => void;
  onDeleteImage: (id: string) => void;
  dragHandleProps?: Record<string, unknown>;
}

export const SeriesStudioSection = ({
  seriesId,
  seriesName,
  isVisible = true,
  images,
  onDeleteSeries,
  onPreviewImage,
  onDeleteImage,
  dragHandleProps,
}: SeriesStudioSectionProps) => {
  const uploadMutation = useUploadStudioImage();
  const createMutation = useCreateStudioImage();
  const updateSeriesMutation = useUpdateStudioSeries();
  const updateImageMutation = useUpdateStudioImage();
  const { data: allStudioSeries = [] } = useStudioSeries();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(seriesName);

  // Droppable zone for cross-series image drag
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `series-drop-${seriesId}`,
    data: { type: "series-drop", seriesId },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    let successCount = 0;

    for (const file of selectedFiles) {
      try {
        const fileName = `${Date.now()}-${file.name}`;
        const url = await uploadMutation.mutateAsync({ file, fileName });
        await createMutation.mutateAsync({
          image_url: url,
          title: null,
          description: null,
          display_order: images.length + successCount,
          series_id: seriesId,
        });
        successCount++;
      } catch {
        // error toast handled by mutation
      }
    }

    setIsUploading(false);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (successCount > 0) {
      toast({
        title: `${successCount} image${successCount > 1 ? "s" : ""} uploaded`,
        description: `Added to ${seriesName}`,
      });
    }
  }, [selectedFiles, images.length, seriesId, seriesName, uploadMutation, createMutation]);

  const handleSaveName = () => {
    if (editName.trim() && editName !== seriesName && seriesId) {
      updateSeriesMutation.mutate({ id: seriesId, name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleMoveImage = (imageId: string, targetSeriesId: string) => {
    updateImageMutation.mutate({ id: imageId, series_id: targetSeriesId });
  };

  const handleToggleVisibility = () => {
    if (seriesId && seriesId !== "__ungrouped") {
      updateSeriesMutation.mutate({ id: seriesId, is_visible: !isVisible });
    }
  };

  const seriesOptions = allStudioSeries.map(s => ({ id: s.id, name: s.name }));

  return (
    <Card
      ref={setDropRef}
      className={`border border-border ${!isVisible ? "opacity-60" : ""} ${isOver ? "ring-2 ring-primary bg-primary/5" : ""}`}
    >
      <CardContent className="p-5 space-y-4">
        {/* Series header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dragHandleProps && seriesId && (
              <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                <GripVertical className="h-5 w-5" />
              </div>
            )}
            {isEditing && seriesId ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setIsEditing(false); }}
                  className="h-8 w-32 text-sm font-bold uppercase"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveName}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base uppercase tracking-wide">
                  {seriesName}
                </h3>
                {seriesId && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => { setEditName(seriesName); setIsEditing(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {images.length} image{images.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {seriesId && seriesId !== "__ungrouped" && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={isVisible}
                  onCheckedChange={handleToggleVisibility}
                  aria-label={isVisible ? "Hide gallery" : "Show gallery"}
                />
                <span className="text-xs text-muted-foreground">{isVisible ? "Visible" : "Hidden"}</span>
              </div>
            )}
            {onDeleteSeries && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={onDeleteSeries}
              >
                <X className="h-4 w-4 mr-1" />
                DELETE
              </Button>
            )}
          </div>
        </div>

        {/* Upload area */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Upload Images
          </p>
          <div className="flex gap-3 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-input file:bg-background file:text-sm file:font-medium hover:file:bg-accent cursor-pointer"
            />
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "UPLOAD"}
            </Button>
          </div>
        </div>

        {/* Sortable image grid — DndContext is in parent StudioImagesManager */}
        {images.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Drag to reorder or move between series: {images.length}
            </p>
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {images.map((img, idx) => (
                  <SortableThumb
                    key={img.id}
                    image={img}
                    index={idx + 1}
                    onPreview={() => onPreviewImage(img)}
                    onDelete={() => onDeleteImage(img.id)}
                    seriesOptions={seriesOptions}
                    currentSeriesId={seriesId}
                    onMoveTo={handleMoveImage}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {/* Drop indicator for empty series */}
        {images.length === 0 && isOver && (
          <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center text-sm text-primary font-medium">
            Drop image here
          </div>
        )}
      </CardContent>
    </Card>
  );
};
