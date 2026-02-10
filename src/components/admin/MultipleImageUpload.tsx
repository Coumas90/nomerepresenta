import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, GripVertical, Star, Loader2, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useUploadImage } from "@/hooks/useArtworkMutations";
import { useArtworkImages, useAddArtworkImage, useDeleteArtworkImage, useUpdateImageOrder, useSetMainImage, useUpdateImageCaption, useUpdateImageMetadata } from "@/hooks/useArtworkImages";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface MultipleImageUploadProps {
  artworkId?: string;
  artworkData?: {
    title: string;
    year: string;
    dimensions: string;
    materials: string;
  };
  onImagesChange?: () => void;
}

interface SortableImageProps {
  image: any;
  index: number;
  artworkData?: MultipleImageUploadProps["artworkData"];
  onDelete: (id: string) => void;
  onSetMain: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onMetadataChange: (id: string, updates: Record<string, any>) => void;
  onToggleDetail: (id: string, isDetail: boolean) => void;
}

const SortableImage = ({ image, index, artworkData, onDelete, onSetMain, onCaptionChange, onMetadataChange, onToggleDetail }: SortableImageProps) => {
  const [expanded, setExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleDetailToggle = (checked: boolean) => {
    onToggleDetail(image.id, checked);
    if (checked && artworkData) {
      // Auto-fill metadata from artwork
      onMetadataChange(image.id, {
        title: artworkData.title,
        year: artworkData.year,
        dimensions: artworkData.dimensions,
        materials: artworkData.materials,
        is_detail: true,
      });
    } else {
      onMetadataChange(image.id, { is_detail: false });
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="relative group hover:ring-2 hover:ring-primary/50 transition-all"
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg z-20" />
      )}
      <div className="relative overflow-hidden rounded-t-lg" {...attributes} {...listeners}>
        <img
          src={image.image_url}
          alt={`Artwork image ${index + 1}`}
          className="w-full h-40 object-cover pointer-events-none"
        />
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <div className="bg-background/90 p-1.5 rounded shadow-sm">
            <GripVertical className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant={image.is_main ? "default" : "secondary"}
            size="icon"
            className="h-8 w-8 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              onSetMain(image.id);
            }}
            title="Set as main image"
          >
            <Star className={`h-4 w-4 ${image.is_main ? 'fill-current' : ''}`} />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-8 w-8 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image.id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1">
          <span className="bg-background/90 text-xs px-2 py-1 rounded font-medium">
            {image.is_main ? "Main Image" : `Image ${index + 1}`}
          </span>
          {image.is_detail && (
            <span className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded font-medium">
              DETAIL
            </span>
          )}
        </div>
      </div>

      {/* Metadata section */}
      <div className="p-2 border-t space-y-2" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        {/* DETAIL toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="text-xs font-medium cursor-pointer">Detail</Label>
          </div>
          <Switch
            checked={image.is_detail || false}
            onCheckedChange={handleDetailToggle}
            className="scale-75"
          />
        </div>

        {/* Expand/collapse metadata */}
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground w-full"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide metadata" : "Edit metadata"}
        </button>

        {expanded && (
          <div className="space-y-2 pt-1">
            <Input
              placeholder="Title"
              defaultValue={image.title || ""}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val !== (image.title || "")) {
                  onMetadataChange(image.id, { title: val || null });
                }
              }}
              className="text-xs h-7"
            />
            <Input
              placeholder="Year"
              defaultValue={image.year || ""}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val !== (image.year || "")) {
                  onMetadataChange(image.id, { year: val || null });
                }
              }}
              className="text-xs h-7"
            />
            <Input
              placeholder="Dimensions"
              defaultValue={image.dimensions || ""}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val !== (image.dimensions || "")) {
                  onMetadataChange(image.id, { dimensions: val || null });
                }
              }}
              className="text-xs h-7"
            />
            <Input
              placeholder="Materials"
              defaultValue={image.materials || ""}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val !== (image.materials || "")) {
                  onMetadataChange(image.id, { materials: val || null });
                }
              }}
              className="text-xs h-7"
            />
            <Input
              placeholder="Caption (optional override)"
              defaultValue={image.caption || ""}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val !== (image.caption || "")) {
                  onCaptionChange(image.id, val);
                }
              }}
              className="text-xs h-7"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

interface UploadingImage {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

const MultipleImageUpload = ({ artworkId, artworkData, onImagesChange }: MultipleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const clearUploadTimeoutRef = useRef<number>();
  const uploadMutation = useUploadImage();
  const addImageMutation = useAddArtworkImage();
  const deleteImageMutation = useDeleteArtworkImage();
  const updateOrderMutation = useUpdateImageOrder();
  const setMainImageMutation = useSetMainImage();
  const updateCaptionMutation = useUpdateImageCaption();
  const updateMetadataMutation = useUpdateImageMetadata();
  const { data: images, isLoading } = useArtworkImages(artworkId);

  useEffect(() => {
    return () => {
      if (clearUploadTimeoutRef.current) {
        clearTimeout(clearUploadTimeoutRef.current);
      }
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const processFiles = async (files: FileList) => {
    if (!files || !artworkId) return;

    setUploading(true);
    
    const newUploadingImages: UploadingImage[] = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'uploading' as const,
      }));

    setUploadingImages(newUploadingImages);

    try {
      for (let i = 0; i < newUploadingImages.length; i++) {
        const uploadingImage = newUploadingImages[i];
        
        try {
          setUploadingImages(prev => 
            prev.map(img => 
              img.id === uploadingImage.id 
                ? { ...img, progress: 30, status: 'uploading' as const }
                : img
            )
          );

          const fileName = `${Date.now()}-${uploadingImage.file.name}`;
          const url = await uploadMutation.mutateAsync({ 
            file: uploadingImage.file, 
            fileName 
          });

          setUploadingImages(prev => 
            prev.map(img => 
              img.id === uploadingImage.id 
                ? { ...img, progress: 60, status: 'processing' as const }
                : img
            )
          );

          await addImageMutation.mutateAsync({
            artwork_id: artworkId,
            image_url: url,
            display_order: (images?.length || 0) + i + 1,
            is_main: (images?.length || 0) === 0 && i === 0,
          });

          setUploadingImages(prev => 
            prev.map(img => 
              img.id === uploadingImage.id 
                ? { ...img, progress: 100, status: 'complete' as const }
                : img
            )
          );

          URL.revokeObjectURL(uploadingImage.preview);
        } catch (error) {
          console.error("Error uploading image:", error);
          setUploadingImages(prev => 
            prev.map(img => 
              img.id === uploadingImage.id 
                ? { ...img, status: 'error' as const, error: 'Error al subir' }
                : img
            )
          );
        }
      }
      
      if (onImagesChange) onImagesChange();
      
      clearUploadTimeoutRef.current = window.setTimeout(() => {
        setUploadingImages([]);
      }, 1000);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
      e.target.value = "";
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!artworkId) return;
    await deleteImageMutation.mutateAsync({ id: imageId, artwork_id: artworkId });
    if (onImagesChange) onImagesChange();
  };

  const handleSetMain = async (imageId: string) => {
    if (!artworkId) return;
    await setMainImageMutation.mutateAsync({ imageId, artworkId });
    if (onImagesChange) onImagesChange();
  };

  const handleCaptionChange = async (imageId: string, caption: string) => {
    if (!artworkId) return;
    await updateCaptionMutation.mutateAsync({ imageId, artworkId, caption: caption || null });
  };

  const handleMetadataChange = async (imageId: string, updates: Record<string, any>) => {
    if (!artworkId) return;
    await updateMetadataMutation.mutateAsync({ imageId, artworkId, updates });
    if (onImagesChange) onImagesChange();
  };

  const handleToggleDetail = async (imageId: string, isDetail: boolean) => {
    // The actual update is handled by handleMetadataChange called from SortableImage
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !images || !artworkId) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);

    const reorderedImages = arrayMove(images, oldIndex, newIndex);
    
    const updates = reorderedImages.map((img, index) => ({
      id: img.id,
      display_order: index + 1,
      artwork_id: artworkId,
    }));

    await updateOrderMutation.mutateAsync(updates);
    if (onImagesChange) onImagesChange();
  };

  if (!artworkId) {
    return (
      <div className="space-y-2">
        <Label>Image Gallery</Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Save the artwork first to upload images
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Image Gallery ({images?.length || 0})</Label>
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="multiple-upload"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("multiple-upload")?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Add Images"}
          </Button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      {images && images.length > 0 && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className={`h-6 w-6 mx-auto mb-1 transition-colors ${
            isDragOver ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <p className="text-sm text-muted-foreground">
            {isDragOver ? 'Drop images here' : 'Drag images here or use the button above'}
          </p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading images...</p>
      ) : (
        <>
          {/* Uploading Images Preview */}
          {uploadingImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Uploading...</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadingImages.map((uploadingImg) => (
                  <Card key={uploadingImg.id} className="relative overflow-hidden">
                    <img
                      src={uploadingImg.preview}
                      alt="Uploading preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-4">
                      {uploadingImg.status === 'error' ? (
                        <div className="text-center">
                          <X className="h-8 w-8 text-destructive mx-auto mb-2" />
                          <p className="text-xs text-destructive">{uploadingImg.error}</p>
                        </div>
                      ) : uploadingImg.status === 'complete' ? (
                        <div className="text-center">
                          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-2">
                            <span className="text-white text-lg">✓</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                      ) : (
                        <div className="w-full text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                          <Progress value={uploadingImg.progress} className="w-full mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {uploadingImg.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Existing Images */}
          {images && images.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <SortableImage
                      key={image.id}
                      image={image}
                      index={index}
                      artworkData={artworkData}
                      onDelete={handleDelete}
                      onSetMain={handleSetMain}
                      onCaptionChange={handleCaptionChange}
                      onMetadataChange={handleMetadataChange}
                      onToggleDetail={handleToggleDetail}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <p className="text-sm text-muted-foreground">
                {isDragOver ? 'Drop images here' : 'Drag images here or click "Add Images"'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MultipleImageUpload;
